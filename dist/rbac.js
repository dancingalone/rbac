'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _async = require('async');

var _role = require('./role');

var _role2 = _interopRequireDefault(_role);

var _permission = require('./permission');

var _permission2 = _interopRequireDefault(_permission);

var _storagesMemory = require('./storages/memory');

var _storagesMemory2 = _interopRequireDefault(_storagesMemory);

var RBAC = (function () {
  /**
   * RBAC constructor
   * @constructor RBAC
   * @param  {Object} options             Options for RBAC
   * @param  {Storage}  [options.storage]  Storage of grants
   * @param  {Array}    [options.roles]            List of role names (String)
   * @param  {Object}   [options.permissions]      List of permissions
   * @param  {Object}   [options.grants]           List of grants
   * @param  {Function} [callback]         Callback function
   */

  function RBAC() {
    var _this = this;

    var options = arguments[0] === undefined ? {} : arguments[0];
    var callback = arguments[1] === undefined ? function () {} : arguments[1];

    _classCallCheck(this, RBAC);

    options.storage = options.storage || new _storagesMemory2['default']();

    this._options = options;

    this.storage.rbac = this;

    var permissions = options.permissions || {};
    var roles = options.roles || [];
    var grants = options.grants || {};

    callback = callback || function () {};

    this.create(roles, permissions, grants, function (err) {
      if (err) {
        return callback(err);
      }

      return callback(null, _this);
    });
  }

  _createClass(RBAC, [{
    key: 'add',

    /**
     * Register role or permission to actual RBAC instance
     * @method RBAC#add
     * @param  {Role|Permission}     item Instance of Base
     * @param  {Function} cb   Callback function
     * @return {RBAC}          Return actual instance
     */
    value: function add(item, cb) {
      if (!item) {
        return cb(new Error('Item is undefined'));
      }

      if (item.rbac !== this) {
        return cb(new Error('Item is associated to another RBAC instance'));
      }

      this.storage.add(item, cb);
      return this;
    }
  }, {
    key: 'get',

    /**
     * Get instance of Role or Permission by his name
     * @method RBAC#get
     * @param  {String}   name  Name of item
     * @param  {Function} cb    Callback function
     * @return {RBAC}           Return instance of actual RBAC
     */
    value: function get(name, cb) {
      this.storage.get(name, cb);
      return this;
    }
  }, {
    key: 'remove',

    /**
     * Remove role or permission from RBAC
     * @method RBAC#remove
     * @param  {Role|Permission} item Instance of role or permission
     * @param  {Function}        cb   Callback function
     * @return {RBAC}                 Current instance
     */
    value: function remove(item, cb) {
      if (!item) {
        return cb(new Error('Item is undefined'));
      }

      if (item.rbac !== this) {
        return cb(new Error('Item is associated to another RBAC instance'));
      }

      this.storage.remove(item, cb);
      return this;
    }
  }, {
    key: 'removeByName',

    /**
     * Remove role or permission from RBAC
     * @method RBAC#removeByName
     * @param  {String}   name Name of role or permission
     * @param  {Function} cb   Callback function
     * @return {RBAC}          Current instance
     */
    value: function removeByName(name, cb) {
      this.get(name, function (err, item) {
        if (err) {
          return cb(err);
        }

        if (!item) {
          return cb(null, false);
        }

        item.remove(cb);
      });

      return this;
    }
  }, {
    key: 'grant',

    /**
     * Grant permission or role to the role
     * @method RBAC#grant
     * @param  {Role}            role  Instance of the role
     * @param  {Role|Permission} child Instance of the role or permission
     * @param  {Function}        cb    Callback function
     * @return {RBAC}                  Current instance
     */
    value: function grant(role, child, cb) {
      if (!role || !child) {
        return cb(new Error('One of item is undefined'));
      }

      if (role.rbac !== this || child.rbac !== this) {
        return cb(new Error('Item is associated to another RBAC instance'));
      }

      if (!RBAC.isRole(role)) {
        return cb(new Error('Role is not instance of Role'));
      }

      this.storage.grant(role, child, cb);
      return this;
    }
  }, {
    key: 'revoke',

    /**
     * Revoke permission or role from the role
     * @method RBAC#revoke
     * @param  {Role}            role   Instance of the role
     * @param  {Role|Permission} child  Instance of the role or permission
     * @param  {Function}        cb     Callback function
     * @return {RBAC}                   Current instance
     */
    value: function revoke(role, child, cb) {
      if (!role || !child) {
        return cb(new Error('One of item is undefined'));
      }

      if (role.rbac !== this || child.rbac !== this) {
        return cb(new Error('Item is associated to another RBAC instance'));
      }

      this.storage.revoke(role, child, cb);
      return this;
    }
  }, {
    key: 'revokeByName',

    /**
     * Revoke permission or role from the role by names
     * @method RBAC#revokeByName
     * @param  {String}   roleName  Instance of the role
     * @param  {String}   childName Instance of the role or permission
     * @param  {Function} cb        Callback function
     * @return {RBAC}               Current instance
     */
    value: function revokeByName(roleName, childName, cb) {
      var _this2 = this;

      (0, _async.parallel)({
        role: function role(callback) {
          return _this2.get(roleName, callback);
        },
        child: function child(callback) {
          return _this2.get(childName, callback);
        }
      }, function (err, results) {
        if (err) {
          return cb(err);
        }

        _this2.revoke(results.role, results.child, cb);
      });

      return this;
    }
  }, {
    key: 'grantByName',

    /**
     * Grant permission or role from the role by names
     * @method RBAC#grantByName
     * @param  {String}   roleName  Instance of the role
     * @param  {String}   childName Instance of the role or permission
     * @param  {Function} cb        Callback function
     * @return {RBAC}               Current instance
     */
    value: function grantByName(roleName, childName, cb) {
      var _this3 = this;

      (0, _async.parallel)({
        role: function role(callback) {
          return _this3.get(roleName, callback);
        },
        child: function child(callback) {
          return _this3.get(childName, callback);
        }
      }, function (err, results) {
        if (err) {
          return cb(err);
        }

        _this3.grant(results.role, results.child, cb);
      });

      return this;
    }
  }, {
    key: 'createRole',

    /**
     * Create a new role assigned to actual instance of RBAC
     * @method RBAC#createRole
     * @param  {String}  roleName Name of new Role
     * @param  {Boolean} [add=true]    True if you need to add it to the storage
     * @return {Role}    Instance of the Role
     */
    value: function createRole(roleName, add, cb) {
      return new _role2['default'](this, roleName, add, cb);
    }
  }, {
    key: 'createPermission',

    /**
     * Create a new permission assigned to actual instance of RBAC
     * @method RBAC#createPermission
     * @param  {String} action   Name of action
     * @param  {String} resource Name of resource
     * @param  {Boolean} [add=true]   True if you need to add it to the storage
     * @param  {Function} cb     Callback function
     * @return {Permission}      Instance of the Permission
     */
    value: function createPermission(action, resource, add, cb) {
      return new _permission2['default'](this, action, resource, add, cb);
    }
  }, {
    key: 'exists',

    /**
     * Callback returns true if role or permission exists
     * @method RBAC#exists
     * @param  {String}   name  Name of item
     * @param  {Function} cb    Callback function
     * @return {RBAC}           Return instance of actual RBAC
     */
    value: function exists(name, cb) {
      this.storage.exists(name, cb);
      return this;
    }
  }, {
    key: 'existsRole',

    /**
     * Callback returns true if role exists
     * @method RBAC#existsRole
     * @param  {String}   name  Name of item
     * @param  {Function} cb    Callback function
     * @return {RBAC}           Return instance of actual RBAC
     */
    value: function existsRole(name, cb) {
      this.storage.existsRole(name, cb);
      return this;
    }
  }, {
    key: 'existsPermission',

    /**
     * Callback returns true if permission exists
     * @method RBAC#existsPermission
     * @param  {String}   action  Name of action
     * @param  {String}   resource  Name of resource
     * @param  {Function} cb    Callback function
     * @return {RBAC}           Return instance of actual RBAC
     */
    value: function existsPermission(action, resource, cb) {
      this.storage.existsPermission(action, resource, cb);
      return this;
    }
  }, {
    key: 'getRole',

    /**
     * Return instance of Role by his name
     * @method RBAC#getRole
     * @param  {String}   name  Name of role
     * @param  {Function} cb    Callback function
     * @return {RBAC}           Return instance of actual RBAC
     */
    value: function getRole(name, cb) {
      this.storage.getRole(name, cb);
      return this;
    }
  }, {
    key: 'getRoles',

    /**
     * Return all instances of Role
     * @method RBAC#getRoles
     * @param  {Function} cb    Callback function
     * @return {RBAC}           Return instance of actual RBAC
     */
    value: function getRoles(cb) {
      this.storage.getRoles(cb);
      return this;
    }
  }, {
    key: 'getPermission',

    /**
     * Return instance of Permission by his action and resource
     * @method RBAC#getPermission
     * @param  {String} action    Name of action
     * @param  {String} resource  Name of resource
     * @param  {Function} cb      Callback function
     * @return {RBAC}             Return instance of actual RBAC
     */
    value: function getPermission(action, resource, cb) {
      this.storage.getPermission(action, resource, cb);
      return this;
    }
  }, {
    key: 'getPermissionByName',

    /**
     * Return instance of Permission by his name
     * @method RBAC#getPermission
     * @param  {String} name      Name of permission
     * @param  {Function} cb      Callback function
     * @return {RBAC}             Return instance of actual RBAC
     */
    value: function getPermissionByName(name, cb) {
      var data = _permission2['default'].decodeName(name);
      this.storage.getPermission(data.action, data.resource, cb);
      return this;
    }
  }, {
    key: 'getPermissions',

    /**
     * Return all instances of Permission
     * @method RBAC#getPermissions
     * @param  {Function} cb    Callback function
     * @return {RBAC}           Return instance of actual RBAC
     */
    value: function getPermissions(cb) {
      this.storage.getPermissions(cb);
      return this;
    }
  }, {
    key: 'createPermissions',

    /**
     * Create multiple permissions in one step
     * @method RBAC#createPermissions
     * @param  {Object}   permissions Object of permissions
     * @param  {Boolean} [add=true]   True if you need to add it to the storage
     * @param  {Function} cb          Callbck function
     * @return {RBAC}                 Instance of actual RBAC
     */
    value: function createPermissions(resources, add, cb) {
      if (typeof add === 'function') {
        cb = add;
        add = true;
      }

      var tasks = {};

      if (!_lodash2['default'].isPlainObject(resources)) {
        return cb(new Error('Resources is not a plain object'));
      }

      Object.keys(resources).forEach(function (resource) {
        resources[resource].forEach(function (action) {
          var _this4 = this;

          var name = _permission2['default'].createName(action, resource);
          tasks[name] = function (callback) {
            return _this4.createPermission(action, resource, add, callback);
          };
        }, this);
      }, this);

      (0, _async.parallel)(tasks, cb);
      return this;
    }
  }, {
    key: 'createRoles',

    /**
     * Create multiple roles in one step assigned to actual instance of RBAC
     * @method RBAC#createRoles
     * @param  {Array}    roleNames  Array of role names
     * @param  {Boolean} [add=true]   True if you need to add it to the storage
     * @param  {Function} cb         Callback function
     * @return {RBAC}                Current instance
     */
    value: function createRoles(roleNames, add, cb) {
      if (typeof add === 'function') {
        cb = add;
        add = true;
      }

      var tasks = {};

      roleNames.forEach(function (roleName) {
        var _this5 = this;

        tasks[roleName] = function (callback) {
          return _this5.createRole(roleName, add, callback);
        };
      }, this);

      (0, _async.parallel)(tasks, cb);
      return this;
    }
  }, {
    key: 'grants',

    /**
     * Grant multiple items in one function
     * @method RBAC#grants
     * @param  {Object}       List of roles
     * @param  {Function} cb  Callback function
     * @return {RBAC}         Current instance
     */
    value: function grants(roles, cb) {
      if (!_lodash2['default'].isPlainObject(roles)) {
        return cb(new Error('Grants is not a plain object'));
      }

      var tasks = [];

      Object.keys(roles).forEach(function (role) {
        roles[role].forEach(function (grant) {
          var _this6 = this;

          tasks.push(function (callback) {
            return _this6.grantByName(role, grant, callback);
          });
        }, this);
      }, this);

      (0, _async.parallel)(tasks, cb);
      return this;
    }
  }, {
    key: 'create',

    /**
     * Create multiple permissions and roles in one step
     * @method RBAC#create
     * @param  {Array}   roleNames       List of role names
     * @param  {Object}  permissionNames List of permission names
     * @param  {Object}  [grants]        List of grants
     * @param  {Array}   cb              Callback function
     * @return {RBAC}                    Instance of actual RBAC
     */
    value: function create(roleNames, permissionNames, grants, cb) {
      var _this7 = this;

      if (typeof grants === 'function') {
        cb = grants;
        grants = null;
      }

      var tasks = {
        permissions: function permissions(callback) {
          return _this7.createPermissions(permissionNames, callback);
        },
        roles: function roles(callback) {
          return _this7.createRoles(roleNames, callback);
        }
      };

      (0, _async.parallel)(tasks, function (err, result) {
        if (err || !grants) {
          return cb(err, result);
        }

        // add grants to roles
        _this7.grants(grants, function (err2) {
          if (err2) {
            return cb(err2);
          }

          cb(null, result);
        });
      });

      return this;
    }
  }, {
    key: '_traverseGrants',

    /**
     * Traverse hierarchy of roles.
     * Callback function returns as second parameter item from hierarchy or null if we are on the end of hierarchy.
     * @method RBAC#_traverseGrants
     * @param  {String}   roleName  Name of role
     * @param  {Function} cb        Callback function
     * @return {RBAC}               Return instance of actual RBAC
     * @private
     */
    value: function _traverseGrants(roleName, cb, next, used) {
      var _this8 = this;

      next = next || [roleName];
      used = used || {};

      var actualRole = next.shift();
      used[actualRole] = true;

      this.storage.getGrants(actualRole, function (err, items) {
        if (err) {
          return cb(err);
        }

        items = items || [];

        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var _name = item.name;

          if (RBAC.isRole(item) && !used[_name]) {
            used[_name] = true;
            next.push(_name);
          }

          if (cb(null, item) === false) {
            return;
          }
        }

        if (next.length === 0) {
          return cb(null, null);
        }

        _this8._traverseGrants(null, cb, next, used);
      });

      return this;
    }
  }, {
    key: 'can',

    /**
     * Return true if role has allowed permission
     * @method RBAC#can
     * @param  {String}  roleName Name of role
     * @param  {String}  action   Name of action
     * @param  {String}  resource Name of resource
     * @param  {Function} cb        Callback function
     * @return {RBAC}             Current instance
     */
    value: function can(roleName, action, resource, cb) {
      this._traverseGrants(roleName, function (err, item) {
        // if there is a error
        if (err) {
          return cb(err);
        }

        // this is last item
        if (!item) {
          return cb(null, false);
        }

        if (RBAC.isPermission(item) && item.can(action, resource) === true) {
          cb(null, true);
          // end up actual traversing
          return false;
        }
      });

      return this;
    }
  }, {
    key: 'canAny',

    /**
     * Check if the role has any of the given permissions.
     * @method RBAC#canAny
     * @param  {String} roleName     Name of role
     * @param  {Array}  permissions  Array (String action, String resource)
     * @param  {Function} cb        Callback function
     * @return {RBAC}                Current instance
     */
    value: function canAny(roleName, permissions, cb) {
      // prepare the names of permissions
      var permissionNames = RBAC.getPermissionNames(permissions);

      // traverse hierarchy
      this._traverseGrants(roleName, function (err, item) {
        // if there is a error
        if (err) {
          return cb(err);
        }

        // this is last item
        if (!item) {
          return cb(null, false);
        }

        if (RBAC.isPermission(item) && permissionNames.indexOf(item.name) !== -1) {
          cb(null, true);
          // end up actual traversing
          return false;
        }
      });

      return this;
    }
  }, {
    key: 'canAll',

    /**
     * Check if the model has all of the given permissions.
     * @method RBAC#canAll
     * @param  {String} roleName     Name of role
     * @param  {Array}  permissions  Array (String action, String resource)
     * @param  {Function} cb        Callback function
     * @return {RBAC}                Current instance
     */
    value: function canAll(roleName, permissions, cb) {
      // prepare the names of permissions
      var permissionNames = RBAC.getPermissionNames(permissions);
      var founded = {};
      var foundedCount = 0;

      // traverse hierarchy
      this._traverseGrants(roleName, function (err, item) {
        // if there is a error
        if (err) {
          return cb(err);
        }

        // this is last item
        if (!item) {
          return cb(null, false);
        }

        if (RBAC.isPermission(item) && permissionNames.indexOf(item.name) !== -1 && !founded[item.name]) {
          founded[item.name] = true;
          foundedCount++;

          if (foundedCount === permissionNames.length) {
            cb(null, true);
            // end up actual traversing
            return false;
          }
        }
      });

      return this;
    }
  }, {
    key: 'hasRole',

    /**
     * Return true if role has allowed permission
     * @method RBAC#hasRole
     * @param  {String}   roleName        Name of role
     * @param  {String}   roleChildName   Name of child role
     * @param  {Function} cb              Callback function
     * @return {RBAC}                     Current instance
     */
    value: function hasRole(roleName, roleChildName, cb) {
      if (roleName === roleChildName) {
        cb(null, true);
        return this;
      }

      this._traverseGrants(roleName, function (err, item) {
        // if there is a error
        if (err) {
          return cb(err);
        }

        // this is last item
        if (!item) {
          return cb(null, false);
        }

        if (RBAC.isRole(item) && item.name === roleChildName) {
          cb(null, true);
          // end up actual traversing
          return false;
        }
      });

      return this;
    }
  }, {
    key: 'getScope',

    /**
     * Return array of all permission assigned to role of RBAC
     * @method RBAC#getScope
     * @param  {String} roleName   Name of role
     * @param  {Function} cb       Callback function
     * @return {RBAC}              Current instance
     */
    value: function getScope(roleName, cb) {
      var scope = [];

      // traverse hierarchy
      this._traverseGrants(roleName, function (err, item) {
        // if there is a error
        if (err) {
          return cb(err);
        }

        // this is last item
        if (!item) {
          return cb(null, scope);
        }

        if (RBAC.isPermission(item) && scope.indexOf(item.name) === -1) {
          scope.push(item.name);
        }
      });

      return this;
    }
  }, {
    key: 'options',

    /**
     * The RBAC's options.
     * @member RBAC#options {Object}
     */
    get: function get() {
      return this._options;
    }
  }, {
    key: 'storage',

    /**
     * The RBAC's storage.
     * @member RBAC#storage {Storage}
     */
    get: function get() {
      return this.options.storage;
    }
  }], [{
    key: 'getPermissionNames',

    /**
     * Convert Array of permissions to permission name
     * @function getPermissionNames
     * @memberof RBAC
     * @param  {Array} permissions List of array items of permission names. It contan action and resource
     * @return {Array}             List of permission names
     * @static
     */
    value: function getPermissionNames(permissions) {
      var permissionNames = [];

      for (var i = 0; i < permissions.length; i++) {
        var permission = permissions[i];
        permissionNames.push(_permission2['default'].createName(permission[0], permission[1]));
      }

      return permissionNames;
    }
  }, {
    key: 'isPermission',
    value: function isPermission(item) {
      return item instanceof _permission2['default'];
    }
  }, {
    key: 'isRole',
    value: function isRole(item) {
      return item instanceof _role2['default'];
    }
  }]);

  return RBAC;
})();

exports['default'] = RBAC;
module.exports = exports['default'];