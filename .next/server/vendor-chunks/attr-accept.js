"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/attr-accept";
exports.ids = ["vendor-chunks/attr-accept"];
exports.modules = {

/***/ "(ssr)/./node_modules/attr-accept/dist/es/index.js":
/*!***************************************************!*\
  !*** ./node_modules/attr-accept/dist/es/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nexports.__esModule = true;\n\nexports[\"default\"] = function (file, acceptedFiles) {\n  if (file && acceptedFiles) {\n    var acceptedFilesArray = Array.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(',');\n    var fileName = file.name || '';\n    var mimeType = (file.type || '').toLowerCase();\n    var baseMimeType = mimeType.replace(/\\/.*$/, '');\n    return acceptedFilesArray.some(function (type) {\n      var validType = type.trim().toLowerCase();\n\n      if (validType.charAt(0) === '.') {\n        return fileName.toLowerCase().endsWith(validType);\n      } else if (validType.endsWith('/*')) {\n        // This is something like a image/* mime type\n        return baseMimeType === validType.replace(/\\/.*$/, '');\n      }\n\n      return mimeType === validType;\n    });\n  }\n\n  return true;\n};//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvYXR0ci1hY2NlcHQvZGlzdC9lcy9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYixrQkFBa0I7O0FBRWxCLGtCQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2pzb24td2ViYXBwLy4vbm9kZV9tb2R1bGVzL2F0dHItYWNjZXB0L2Rpc3QvZXMvaW5kZXguanM/MDQ0ZCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKGZpbGUsIGFjY2VwdGVkRmlsZXMpIHtcbiAgaWYgKGZpbGUgJiYgYWNjZXB0ZWRGaWxlcykge1xuICAgIHZhciBhY2NlcHRlZEZpbGVzQXJyYXkgPSBBcnJheS5pc0FycmF5KGFjY2VwdGVkRmlsZXMpID8gYWNjZXB0ZWRGaWxlcyA6IGFjY2VwdGVkRmlsZXMuc3BsaXQoJywnKTtcbiAgICB2YXIgZmlsZU5hbWUgPSBmaWxlLm5hbWUgfHwgJyc7XG4gICAgdmFyIG1pbWVUeXBlID0gKGZpbGUudHlwZSB8fCAnJykudG9Mb3dlckNhc2UoKTtcbiAgICB2YXIgYmFzZU1pbWVUeXBlID0gbWltZVR5cGUucmVwbGFjZSgvXFwvLiokLywgJycpO1xuICAgIHJldHVybiBhY2NlcHRlZEZpbGVzQXJyYXkuc29tZShmdW5jdGlvbiAodHlwZSkge1xuICAgICAgdmFyIHZhbGlkVHlwZSA9IHR5cGUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgIGlmICh2YWxpZFR5cGUuY2hhckF0KDApID09PSAnLicpIHtcbiAgICAgICAgcmV0dXJuIGZpbGVOYW1lLnRvTG93ZXJDYXNlKCkuZW5kc1dpdGgodmFsaWRUeXBlKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsaWRUeXBlLmVuZHNXaXRoKCcvKicpKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgc29tZXRoaW5nIGxpa2UgYSBpbWFnZS8qIG1pbWUgdHlwZVxuICAgICAgICByZXR1cm4gYmFzZU1pbWVUeXBlID09PSB2YWxpZFR5cGUucmVwbGFjZSgvXFwvLiokLywgJycpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWltZVR5cGUgPT09IHZhbGlkVHlwZTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/attr-accept/dist/es/index.js\n");

/***/ })

};
;