import Ember from "ember";
import config from "../config/environment";

let defaultHeaders = {
  "X-GOODCITY-APP-NAME": config.APP.NAME,
  "X-GOODCITY-APP-VERSION": config.APP.VERSION,
  "X-GOODCITY-APP-SHA": config.APP.SHA,
};

function _read(data) {
  if (typeof data == "function") {
    return data();
  }
  return data;
}

function AjaxPromise(url, type, authToken, data, args, language = "en") {
  return new Ember.RSVP.Promise(function (resolve, reject) {
    var headers = Ember.$.extend({}, _read(defaultHeaders), {
      "Accept-Language": language,
    });

    if (authToken) {
      headers["Authorization"] = "Bearer " + authToken;
    }

    Ember.$.ajax(
      Ember.$.extend(
        {},
        {
          type: type,
          dataType: "json",
          data: data,
          language: language,
          url: url.indexOf("http") === -1 ? config.APP.SERVER_PATH + url : url,
          headers: headers,
          success: function (data) {
            Ember.run(function () {
              resolve(data);
            });
          },
          error: function (jqXHR) {
            jqXHR.url = url;
            Ember.run(function () {
              reject(jqXHR);
            });
          },
        },
        args
      )
    );
  });
}

AjaxPromise.setDefaultHeaders = function (headers) {
  defaultHeaders = headers;
};

export default AjaxPromise;
