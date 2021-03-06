import Ember from "ember";
import Tribute from "npm:tributejs";

import AjaxPromise from "../utils/ajax-promise";

let users = null;
const selectedUsers = [];
const remoteSearch = (context, cb) => {
  const token = JSON.parse(window.localStorage.authToken);
  new AjaxPromise("/mentionable_users", "GET", token, {
    order_id: context.orderId,
    offer_id: context.offerId,
    is_private: context.isPrivate
  }).then((data) => {
    users = data.users;
    return cb(users);
  });
};

export default Ember.Component.extend({
  tagName: "p",
  contentEditable: "true",
  attributeBindings: ["disabled", "value", "setBody"],
  classNames: "message-bar mentionable",
  disabled: false,
  session: Ember.inject.service(),

  valueObserver: function () {
    Ember.run.once(this, "processValue");
  }.observes("value"),

  processValue: function () {
    if (!this.value) {
      this.element.innerText = "";
    }
  },

  autoScroll: function () {
    window.scrollTo(0, document.body.scrollHeight);
  },

  didInsertElement: function() {
    const _this = this;
    const tribute = new Tribute({
      values:  (text, cb) => {
        if (!users) {
          return remoteSearch(_this,(users) => cb(users));
        }
        return cb(users);
      },
      menuItemTemplate: (item) => {
        return `<div class='item'><img class='mentionedImage' src="assets/images/user.svg"></img> ${item.original.name}</div>`;
      },
      selectTemplate: function (item) {
        if (typeof item === "undefined") return null;

        selectedUsers.push(item.original);
        return `<span class='mentioned' contenteditable="false">@${item.original.name}</span>`;
      },
      selectClass: "highlight",
      noMatchTemplate: () => null,
      // menuContainer: document.getElementsByClassName('message-textbar')[0]
      menuContainer: document.getElementsByClassName(
        _this.menuContainer
      )[0],

      lookup: 'name'
    });

    tribute.attach(Ember.$(this.element));

    this.element.addEventListener("input", function () {
      let parsedText = this.innerText;
      let displayText = this.innerText;
      selectedUsers.forEach((user) => {
        parsedText = parsedText.replace(
          new RegExp(`@${user.name}`, "g"),
          `[:${user.id}]`
        );

        displayText = displayText.replace(
          new RegExp(`@${user.name}`, "g"),
          `<span class='mentioned'>@${user.name}</span>`
        );
      });

      _this.setMessageContext({ parsedText, displayText });
    });
    // scrolling down to bottom of page
    this.autoScroll();
  },
});
