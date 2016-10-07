// You should only use the `new Promise` constructor from bluebird
var Promise = require('bluebird');

/**
 * Return a function that wraps `nodeStyleFn`. When the returned function is invoked,
 * it will return a promise which will be resolved or rejected, depending on 
 * the execution of the now-wrapped `nodeStyleFn`
 *
 * In other words:
 *   - If `nodeStyleFn` succeeds, the promise should be resolved with its results
 *   - If nodeStyleFn fails, the promise should be rejected with the error
 *
 * Because the returned function returns a promise, it does and should not
 * expect a callback function as one of its arguments
 */

var promisify = function(nodeStyleFn) {

  var promiseFunction = function() {
    var args = Array.prototype.slice.call(arguments);  

    return new Promise(function(resolve, reject) {
      var cb = function(err, data) {
        if (err) {
          return reject(err);
        } else {
          return resolve(data);
        }
      };
      nodeStyleFn.apply(this, args.concat(cb));
    });
  };

  return promiseFunction;
};


/**
 * Given an array which contains promises, return a promise that is
 * resolved if and when all the items in the array are resolved.
 *
 * The promise's resolve value should be an array that maps to the
 * respective positions in the original array of promises.
 *
 * If any promise in the array rejects, the returned promise
 * is rejected with the rejection reason.
 */

var all = function(arrayOfPromises) {

  return new Promise((resolve, reject) => {

    var counter = 0;
    var results = Array(arrayOfPromises.length);

    var checkComplete = function() {
      if (counter === arrayOfPromises.length) {
        return resolve(results);
      }
    };

    for (var i = 0; i < arrayOfPromises.length; i++) {
      arrayOfPromises[i].then(function(result) {
        var index = this;
        counter++;
        results[index] = result;
        checkComplete();
      }.bind(i));
      arrayOfPromises[i].catch(function(err) { reject(err); });
    }
    
  });
};

/**
 * Given an array of promises, return a promise that is resolved or rejected,
 * resolving with whatever the resolved value or rejection reason was from
 * the first to be resolved/rejected promise in the passed-in array
 */

var race = function(arrayOfPromises) {

  return new Promise((resolve, reject) => {
    for (var i = 0; i < arrayOfPromises.length; i++) {
      arrayOfPromises[i].then(function(result) {
        resolve(result);
      });
      arrayOfPromises[i].catch(function(err) {
        reject(err);
      });
    }
  });

};

// Export these functions so we can unit test them
module.exports = {
  all: all,
  race: race,
  promisify: promisify
};
