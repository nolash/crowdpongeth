"use strict";

exports.__esModule = true;

var _recaptcha = require("./recaptcha");

var _recaptcha2 = _interopRequireDefault(_recaptcha);

var _reactAsyncScript = require("react-async-script");

var _reactAsyncScript2 = _interopRequireDefault(_reactAsyncScript);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var callbackName = "onloadcallback";
var options = typeof window !== "undefined" && window.recaptchaOptions || {};

var lang = options.lang ? "&hl=" + options.lang : "";
var hostname = options.useRecaptchaNet ? "recaptcha.net" : "www.google.com";
var URL = "https://" + hostname + "/recaptcha/api.js?onload=" + callbackName + "&render=explicit" + lang;
var globalName = "grecaptcha";

exports.default = (0, _reactAsyncScript2.default)(_recaptcha2.default, URL, {
  callbackName: callbackName,
  globalName: globalName,
  exposeFuncs: ["getValue", "getWidgetId", "reset", "execute"]
});