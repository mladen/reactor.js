// Generated by CoffeeScript 1.7.1
(function() {
  var CompoundError, OBSERVER, SIGNAL, dependencyStack, global,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SIGNAL = "SIGNAL";

  OBSERVER = "OBSERVER";

  global = typeof exports !== "undefined" && exports !== null ? exports : this;

  dependencyStack = [];

  global.Signal = function(definition) {
    var signalCore, signalInterface;
    signalCore = {
      dependencyType: SIGNAL,
      definition: null,
      value: null,
      error: null,
      dependencies: [],
      dependents: [],
      update: function() {
        var dependency, dependentIndex, error, _i, _len, _ref;
        _ref = this.dependencies;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dependency = _ref[_i];
          dependentIndex = dependency.dependents.indexOf(this);
          dependency.dependents[dependentIndex] = null;
        }
        this.dependencies = [];
        this.error = null;
        if (this.definition instanceof Function) {
          dependencyStack.push(this);
          try {
            return this.value = this.definition();
          } catch (_error) {
            error = _error;
            this.error = error;
            throw error;
          } finally {
            dependencyStack.pop();
          }
        } else {
          return this.value = this.definition;
        }
      },
      read: function() {
        var dependent, signalError;
        dependent = dependencyStack[dependencyStack.length - 1];
        if (dependent != null) {
          if (__indexOf.call(this.dependents, dependent) < 0) {
            this.dependents.push(dependent);
          }
          if (__indexOf.call(dependent.dependencies, this) < 0) {
            dependent.dependencies.push(this);
          }
        }
        if (this.error) {
          signalError = new Error('Reading from corrupted Signal');
          throw signalError;
        } else {
          return this.value;
        }
      },
      write: function(newDefinition) {
        var dependencyQueue, dependent, error, errorList, errorMessage, observer, observerList, target, _i, _j, _len, _len1, _ref;
        this.definition = newDefinition;
        dependencyQueue = [this];
        observerList = [];
        errorList = [];
        while (dependencyQueue.length >= 1) {
          target = dependencyQueue.shift();
          if (target != null) {
            try {
              target.update();
            } catch (_error) {
              error = _error;
              errorList.push(error);
            }
            _ref = target.dependents;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              dependent = _ref[_i];
              if (dependent != null) {
                if (dependent.dependencyType === SIGNAL) {
                  if (__indexOf.call(dependencyQueue, dependent) < 0) {
                    dependencyQueue.push(dependent);
                  }
                } else if (dependent.dependencyType === OBSERVER) {
                  if (__indexOf.call(observerList, dependent) < 0) {
                    observerList.push(dependent);
                  }
                }
              }
            }
          }
        }
        for (_j = 0, _len1 = observerList.length; _j < _len1; _j++) {
          observer = observerList[_j];
          try {
            observer.update();
          } catch (_error) {
            error = _error;
            errorList.push(error);
          }
        }
        if (errorList.length === 1) {
          throw errorList[0];
        } else if (errorList.length > 1) {
          errorMessage = errorList.length + " errors due to signal write";
          throw new CompoundError(errorMessage, errorList);
        }
        return this.value;
      }
    };
    signalInterface = function(newDefinition) {
      if (arguments.length === 0) {
        return signalCore.read();
      } else {
        if (newDefinition instanceof Object) {
          signalInterface.set = function(key, value) {
            var output;
            output = newDefinition[key] = value;
            signalCore.write(newDefinition);
            return output;
          };
        } else {
          delete signalInterface.set;
        }
        if (newDefinition instanceof Array) {
          signalInterface.push = function() {
            var output;
            output = newDefinition.push.apply(newDefinition, arguments);
            signalCore.write(newDefinition);
            return output;
          };
          signalInterface.pop = function() {
            var output;
            output = newDefinition.pop.apply(newDefinition, arguments);
            signalCore.write(newDefinition);
            return output;
          };
          signalInterface.shift = function() {
            var output;
            output = newDefinition.shift.apply(newDefinition, arguments);
            signalCore.write(newDefinition);
            return output;
          };
          signalInterface.unshift = function() {
            var output;
            output = newDefinition.unshift.apply(newDefinition, arguments);
            signalCore.write(newDefinition);
            return output;
          };
          signalInterface.reverse = function() {
            var output;
            output = newDefinition.reverse.apply(newDefinition, arguments);
            signalCore.write(newDefinition);
            return output;
          };
          signalInterface.sort = function() {
            var output;
            output = newDefinition.sort.apply(newDefinition, arguments);
            signalCore.write(newDefinition);
            return output;
          };
          signalInterface.splice = function() {
            var output;
            output = newDefinition.splice.apply(newDefinition, arguments);
            signalCore.write(newDefinition);
            return output;
          };
        } else {
          delete signalInterface.push;
          delete signalInterface.pop;
          delete signalInterface.shift;
          delete signalInterface.unshift;
          delete signalInterface.reverse;
          delete signalInterface.sort;
          delete signalInterface.splice;
        }
        return signalCore.write(newDefinition);
      }
    };
    signalInterface(definition);
    return signalInterface;
  };

  global.Observer = function(response) {
    var observerCore, observerInterface;
    observerCore = {
      dependencyType: OBSERVER,
      response: null,
      dependencies: [],
      update: function() {
        var dependency, observerIndex, _i, _len, _ref;
        _ref = this.dependencies;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dependency = _ref[_i];
          observerIndex = dependency.dependencies.indexOf(this);
          dependency.dependents[observerIndex] = null;
        }
        this.dependencies = [];
        if (response instanceof Function) {
          dependencyStack.push(this);
          try {
            return this.response();
          } finally {
            dependencyStack.pop();
          }
        }
      },
      write: function(newResponse) {
        this.response = newResponse;
        return this.update();
      }
    };
    observerInterface = function(newResponse) {
      return write(newResponse);
    };
    observerCore.write(response);
    return observerInterface;
  };

  CompoundError = (function(_super) {
    __extends(CompoundError, _super);

    function CompoundError(message, errorArray) {
      var error, errorDescription, errorProperties, property, proxyError, _i, _j, _len, _len1, _ref, _ref1;
      this.errors = errorArray;
      _ref = this.errors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        error = _ref[_i];
        errorDescription = (_ref1 = error.stack) != null ? _ref1 : error.toString();
        message = message + '\n' + errorDescription;
      }
      proxyError = Error.call(this, message);
      proxyError.name = "CompoundError";
      errorProperties = Object.getOwnPropertyNames(proxyError);
      for (_j = 0, _len1 = errorProperties.length; _j < _len1; _j++) {
        property = errorProperties[_j];
        if (proxyError.hasOwnProperty(property)) {
          this[property] = proxyError[property];
        }
      }
      return this;
    }

    return CompoundError;

  })(Error);

  global.CompoundError = CompoundError;

}).call(this);
