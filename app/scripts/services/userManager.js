'use strict';

angular.module('gtrApp')
  .provider('UserManager', function () {
    this.$get = function() {
      var userManager = {
        users: {},

        addUserPulling: function(pull) {
          var clone = function(obj) {
            var clone = {};
            for (var i in obj) {
              if (obj.hasOwnProperty(i)) {
                clone[i] = obj[i];
              }
            }
            return obj;
          };

          var user = pull.user;
          if (!this.users[user.id]) {
            this.users[user.id] = clone(pull.user);
            this.users[user.id].pulls = [];
          }
          var isRegisteredPull = this.users[user.id].pulls.some(function(localPull) {
            return pull.id === localPull.id;
          });
          if (isRegisteredPull) { return; }
          this.users[user.id].pulls.push(pull);
          this.setUserPullsState(this.users[user.id]);
        },

        removeUserPulling: function(pull) {
          var user = pull.user;
          if (!user || !this.users[user.id]) { return; }

          this.users[user.id].pulls.some(function(localPull, index) {
            if (pull.id !== localPull.id) { return false; }
            this.users[user.id].pulls.splice(index, 1);
          }, this);
        },

        refreshUsersPulls: function() {
          for (var i in this.users) {
            if (this.users.hasOwnProperty(i)) { return; }
            this.setUserPullsState(this.users[i]);
          }
        },

        /**
         * setUserPullsState
         * Sets a state associated to every user about the status of his pull requests.
         * Rules:
         * If there is any error/failure, the state is "error" or "failure"
         * Without errrors, if there are any successes, the state is "success"
         * Without any success, there is either a "pending" state or no state.
         *
         * This state controls the color of the border around an user
         *
         * @param {Object} user
         */
        setUserPullsState: function(user) {
          user.pullsState = user.pulls.reduce(function(previousState, pull) {
            if (!pull.statuses[0] || !pull.statuses[0].state ||
              previousState === 'error' || previousState === 'failure' ||
              (previousState === 'success' && pull.statuses[0].state === 'pending')) {
              return previousState;
            }
            return pull.statuses[0].state;
          }, null);
        }
      };
      return userManager;
    };
  });
