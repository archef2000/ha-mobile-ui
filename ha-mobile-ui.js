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
            return true;
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
        this.content.style.paddingRight = "var(--mdc-drawer-width)";
        this.content.style.paddingLeft = "0px";
        this.aside.style.setProperty("right", "0px", "important");
        this.aside.style.setProperty("inset-inline-start", "revert", "important");

        var sidebarObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                list = mutation.target.classList;
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

window.mobileUI = new MobileUI();
window.mobileUI.start();