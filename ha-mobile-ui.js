import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

class MobileUI {
    constructor() {
        console.log("Starting wired toggle card");
        var haDrawer = document.querySelector("home-assistant").shadowRoot.querySelector("home-assistant-main").shadowRoot.querySelector("ha-drawer");
        this.haDrawer = haDrawer;
        this.aside = haDrawer.shadowRoot.querySelector("aside");
        this.haSidebar = haDrawer.querySelector("ha-sidebar");
        this.content = haDrawer.shadowRoot.querySelector(".mdc-drawer-app-content");
        this.observers = {
            sidebar: null,
            tooltip: null,
            edit: null,
        }
    }
    start() {
        if (this.getState("sidebar")) {
            console.log("moving sidebar");
            this.moveSidebar();
        }
        if (this.getState("navbar")) {
            console.log("moving navbar");
            this.moveNavbar();
        }
        console.log('Starting wired toggle card');
    }

    getState(type) {
        if (window.localStorage.getItem("fast_mobile_ui-" + type)) {
            console.log("getState", window.localStorage.getItem("fast_mobile_ui-" + type));
            return window.localStorage.getItem("fast_mobile_ui-" + type);
        } else {
            console.log("no state found");
            return false;
        }
    }

    setState(type, state) {
        window.localStorage.setItem('navbar_position', "navbarPosition");
        window.location.reload()
    }

    getHuiRoot() {
        return this.haDrawer.querySelector("partial-panel-resolver").querySelector("ha-panel-lovelace").shadowRoot.querySelector("hui-root").shadowRoot;
    }

    getTileView() {
        return this.getHuiRoot().querySelector("div").querySelector("#view").querySelector("*").querySelector("*").shadowRoot;
    }

    isEditMode() {
        return this.getTileView().querySelector("div").classList.contains("edit-mode");
    }

    moveTooltip() {
        tooltip = this.haSidebar.shadowRoot.querySelector("div.tooltip")

        var observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (tooltip.style.left) {
                    tooltip.style.right = "59px";
                    tooltip.style.left = null;
                }
            }
        });
        observer.observe(tooltip, {
            attributes: true,
            attributeFilter: ['style']
        });

    }

    moveSidebar(revert = false) {
        if (revert) {
            window.mobileUI.content.style.paddingLeft = "var(--mdc-drawer-width)";
            window.mobileUI.content.style.paddingRight = "0px";
            window.mobileUI.aside.style.removeProperty("right");
            window.mobileUI.aside.style.removeProperty("inset-inline-start");
            if (window.mobileUI.observers.sidebar) {
                window.mobileUI.observers.sidebar.disconnect();
            }
            return;
        }
        window.mobileUI.content.style.paddingRight = "var(--mdc-drawer-width)";
        window.mobileUI.content.style.paddingLeft = "0px";
        window.mobileUI.aside.style.setProperty("right", "0px", "important");
        window.mobileUI.aside.style.setProperty("inset-inline-start", "revert", "important");

        var sidebarObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                var list = mutation.target.classList;
                console.log(list);
                if (list.contains("mdc-drawer--closing")) {
                    console.log("closing");
                    mutation.target.style.transform = "translateX(100%)";
                }
                if (!list.contains("mdc-drawer--open")) {
                    mutation.target.style.removeProperty("transform");
                }
                if (list.contains("mdc-drawer--animate") && list.contains("mdc-drawer--open")) {
                    if (!list.contains("mdc-drawer--opening")) {
                        mutation.target.style.transform = "translateX(100%)";
                    } else {
                        console.log("opening")
                        mutation.target.style.transform = "translateX(-0)";
                    }
                }
            }
        });
        sidebarObserver.observe(this.aside, {
            attributes: true,
            attributeFilter: ['class']
        });
        this.observers.sidebar = sidebarObserver;
    }

    moveNavbar(revert = false) {
        console.log("moveNavbar", revert);
        const huiRoot = window.mobileUI.getHuiRoot();
        var navbar = huiRoot.querySelector(".header");
        var view = huiRoot.querySelector("#view");
        if (!revert) {
            navbar.style.top = "auto";
            navbar.style.bottom = "0px";
            view.style.paddingTop = "env(safe-area-inset-top)"
            view.style.paddingBottom = "calc(var(--header-height) + env(safe-area-inset-bottom))"

        } else {
            navbar.style.top = "0px";
            navbar.style.bottom = "auto";
            if (window.mobileUI.isEditMode()) {
                view.style.paddingTop = null;
            } else {
                view.style.paddingTop = "calc(var(--header-height) + env(safe-area-inset-top))"

            }
            view.style.paddingBottom = "env(safe-area-inset-bottom)"
        }


    }

    reverseTabs() {
        if (!this.isEditMode()) {
            toolbar = this.getHuiRoot().querySelector(".toolbar");
            var menu = toolbar.querySelector("ha-menu-button");
            var actions = toolbar.querySelector(".action-items");
            var haTabs = toolbar.querySelector("ha-tabs");
            var tabsContent = haTabs.shadowRoot.querySelector("#tabsContent");
            toolbar.appendChild(menu);
            toolbar.insertBefore(actions, toolbar.firstChild);
            tabsContent.style.right = 0;
            // reverse items of tabs
            var tabs = Array.from(haTabs.children);
            tabs.reverse();
            tabs.forEach((tab) => {
                haTabs.appendChild(tab);
            });
        }

    }

}


class MobileUIConfigurationCard extends LitElement {

    getState(type) {
        if (window.localStorage.getItem("fast_mobile_ui-" + type)) {
            console.log("getState", window.localStorage.getItem("fast_mobile_ui-" + type));
            return window.localStorage.getItem("fast_mobile_ui-" + type);
        } else {
            console.log("no state found");
            return false;
        }
    }

    setState(type, state) {
        console.log(type, state, "setState");
        window.localStorage.setItem("fast_mobile_ui-" + type, state);
    }

    _handleClick(ev) {
        ev.stopPropagation();
        console.log(switchElement.__checked);
        this.setState(type, switchElement.__checked);
        callback(!switchElement.__checked);
    }

    createSwitchElement(name, type, callback) {
        var box = document.createElement("div");
        box.style.height = "40px";
        var title = document.createElement("div");
        title.style.display = "inline-block";
        title.style.padding = "10px 0px";
        title.style.paddingLeft = "15px";
        title.title = name;
        title.innerText = name;
        box.appendChild(title);
        var switchElement = document.createElement("label");
        switchElement.classList.add("switch");
        var switchInput = document.createElement("input");
        switchInput.type = "checkbox";
        switchInput.checked = window.mobileUI.getState(type) == "true";
        switchInput.onchange = () => {
            console.log(switchInput.checked);
            this.setState(type, switchInput.checked);
            callback(!switchInput.checked);
        };
        switchElement.appendChild(switchInput);
        var switchSpan = document.createElement("span");
        switchSpan.classList.add("slider");
        switchElement.appendChild(switchSpan);
        box.appendChild(switchElement);
        return box;
    }

    createButtonElement(name, callback) {
        var root = document.createElement("div");
        root.style.height = "40px";
        var title = document.createElement("div");
        title.style.display = "inline-block";
        title.style.padding = "10px 0px";
        title.style.paddingLeft = "15px";
        title.title = name;
        title.innerText = name;
        root.appendChild(title);
        var mwc = document.createElement("mwc-button");
        mwc.onclick = callback;
        mwc.label = name;
        mwc.style = "float: right;"
        root.appendChild(mwc);
        return root;
    }

    render() {
        var card = document.createElement("ha-card");
        var root = document.createElement("div");
        root.id = "states";
        root.classList.add("card-content");
        root.appendChild(this.createSwitchElement("Sidebar right", "sidebar", window.mobileUI.moveSidebar));
        root.appendChild(this.createSwitchElement("Navbar bottom", "navbar", window.mobileUI.moveNavbar));
        root.appendChild(this.createButtonElement("Reload page", () => window.location.reload(true)));
        card.appendChild(root);
        return html `${card}`;
    }

    static get styles() {
        return css `
        #states > * {
            margin: 8px 0px;
        }
        #states > *:first-child {
            margin-top: 0px;
        }
        #states > *:last-child {
            margin-bottom: 0px;
        }

        .switch {
            position: relative;
            display: inline-block;
            width: 45px;
            height: 26px;
            float: right;
            bottom: -6px;
          }
          
          .switch input { 
            opacity: 0;
            width: 0;
            height: 0;
          }
          
          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 34px;
          }
          
          .slider:before {
            position: absolute;
            content: "";
            height: 22px;
            width: 22px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 34px;
          }
          
          input:checked + .slider {
            background-color: #2196F3;
          }
          
          input:focus + .slider {
            box-shadow: 0 0 1px #2196F3;
          }
          
          input:checked + .slider:before {
            -webkit-transform: translateX(19px);
            -ms-transform: translateX(19px);
            transform: translateX(19px);
            border-radius: 50%;
          }
        `;
    }

    setConfig(config) {};

    getCardSize() {
        return 3;
    }
}

customElements.define("mobile-ui-configuration-card", MobileUIConfigurationCard);
window.customCards.push({
    type: 'mobile-ui-configuration-card',
    name: 'Mobile UI Configuration Card',
    description: 'Configure the mobile UI'
});

window.mobileUI = new MobileUI();
window.mobileUI.start();
