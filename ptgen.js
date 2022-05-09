import { gen_douban } from "./lib/douban";
import { gen_imdb } from "./lib/imdb";
import { gen_bangumi } from "./lib/bangumi";
import { gen_steam } from "./lib/steam";
import { gen_indienova } from "./lib/indienova";
import { gen_epic } from "./lib/epic";
import dynamodb from "./dynamodb";

const support_list = {
  // 注意value值中正则的分组只能有一个，而且必须是sid信息，其他分组必须设置不捕获属性
  "douban": /(?:https?:\/\/)?(?:(?:movie|www)\.)?douban\.com\/(?:subject|movie)\/(\d+)\/?/,
  "imdb": /(?:https?:\/\/)?(?:www\.)?imdb\.com\/title\/(tt\d+)\/?/,
  "bangumi": /(?:https?:\/\/)?(?:bgm\.tv|bangumi\.tv|chii\.in)\/subject\/(\d+)\/?/,
  "steam": /(?:https?:\/\/)?(?:store\.)?steam(?:powered|community)\.com\/app\/(\d+)\/?/,
  "indienova": /(?:https?:\/\/)?indienova\.com\/game\/(\S+)/,
  "epic": /(?:https?:\/\/)?www\.epicgames\.com\/store\/[a-zA-Z-]+\/product\/(\S+)\/\S?/
};

const support_site_list = Object.keys(support_list);


export async function handle(event, context, callback) {
  if (!event.queryStringParameters || !event.queryStringParameters.url) {
    callback(null, {
      statusCode: 400,
      body: "URL parameter not found!"
    });
    return;
  }

  let site, sid;
  let url_ = event.queryStringParameters.url;
  for (let site_ in support_list) {
    let pattern = support_list[site_];
    if (url_.match(pattern)) {
      site = site_;
      sid = url_.match(pattern)[1];
      break;
    }
  }

  if (site == null || sid == null) {
    callback(null, {
      statusCode: 400,
      body: `URL parameter not supported: ${url_}!`
    });
  }
  const cache_key = `ptgen-${site}-${sid}`;

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: cache_key,
    },
  };

  const timestamp = new Date().getTime();
  dynamodb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
    }
    if (result.Item) {
      if (timestamp - result.Item.createdAt <= 1000 * 60 * 60 * 24 * 3 /* 3 days */) {
        callback(null, {
          statusCode: 200,
          body: JSON.stringify({
            cached: true,
            ...result.Item.ptgen
          })
        });
        return;
      } else {
        dynamodb.delete(params, (error) => {
          // handle potential errors
          if (error) {
            console.error(error);
          }
        });
      }
    }
  });

  let response_data = null;
  if (support_site_list.includes(site)) {
    // 进入对应资源站点处理流程
    if (site === "douban") {
      response_data = await gen_douban(sid);
    } else if (site === "imdb") {
      response_data = await gen_imdb(sid);
    } else if (site === "bangumi") {
      response_data = await gen_bangumi(sid);
    } else if (site === "steam") {
      response_data = await gen_steam(sid);
    } else if (site === "indienova") {
      response_data = await gen_indienova(sid);
    } else if (site === "epic") {
      response_data = await gen_epic(sid);
    } else {
      // 没有对应方法的资源站点，（真的会有这种情况吗？
      callback(null, {
        statusCode: 400,
        body: "Miss generate function for `site`: " + site + "."
      });
      return;
    }
  } else {
    callback(null, {
      statusCode: 400,
      body: "Unknown value of key `site`."
    });
    return;
  }

  if (response_data) {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        cached: false,
        ...response_data
      })
    });

    dynamodb.put({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        id: cache_key,
        ptgen: response_data,
        createdAt: timestamp,
      },
    }, (error) => {
      // handle potential errors
      if (error) {
        console.error(error);
      }
    });
  }
};
