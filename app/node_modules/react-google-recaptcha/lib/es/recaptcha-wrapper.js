import ReCAPTCHA from "./recaptcha";
import makeAsyncScriptLoader from "react-async-script";

var callbackName = "onloadcallback";
var options = typeof window !== "undefined" && window.recaptchaOptions || {};

var lang = options.lang ? "&hl=" + options.lang : "";
var hostname = options.useRecaptchaNet ? "recaptcha.net" : "www.google.com";
var URL = "https://" + hostname + "/recaptcha/api.js?onload=" + callbackName + "&render=explicit" + lang;
var globalName = "grecaptcha";

export default makeAsyncScriptLoader(ReCAPTCHA, URL, {
  callbackName: callbackName,
  globalName: globalName,
  exposeFuncs: ["getValue", "getWidgetId", "reset", "execute"]
});