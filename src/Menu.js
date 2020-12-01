import MenuItem from "./_MenuItem";
import {getHeighestElement, getClosest} from 'dauphine-js';
import Emitter from 'dauphine-js/dist/emitter';

export default class Menu extends Emitter {

    constructor(settings) {

        super();

        /**
         * *******************************************************
         * Config default
         * *******************************************************
         */
        this.options = {
            'menuSelector': '[js-menu]',
            'linkSelector': '[js-menu-link]',
            'noLinkSelector': '[js-menu-nolink]',
            'parentSelector': '[js-menu-item]',
            'parentSubmenuSelector': '[js-menu-haschildren]',
            'submenuSelector': '[js-menu-sublevel]',
            'eventSelector': '[js-menu-event]',
            'closeSelector': '[js-menu-close]',
            'overlaySelector': '[js-menu-overlay]',
            'backSelector': '[js-menu-back]',
            'searchSelector': '[js-search]',
            'searchOpenSelector': '[js-search-open]',
            'searchCloseSelector': '[js-search-close]',
            'menuBurgerSelector': '[js-menu-burger]',
            'menuBurgerLabelSelector': '[js-menu-burger-label]',
            'menuMobileSelector': '[js-menu-mobile]',
            'stickyMobileSelector': '[js-menu-sticky-mobile]',
            'stickySelector': '[js-menu-sticky]',
            'equalizeHeightSelector': '[js-menu-equalizeheight]',
            'skipLinksSelector': '[js-menu-skip-links]',
            'stickyScrollTop': false,
            'stickyOffset': 300,
            'closeMenuOnScroll': false,
            'selectByDataAttribute': false,
            'responsiveBreakpoint': 1280,
            'accessibility': true,
            'openingTime': 250
        };

        /**
         * *******************************************************
         * Merge object
         * *******************************************************
         */
        this.options = Object.assign(this.options, settings);

        /**
         * *******************************************************
         * Global variables
         * *******************************************************
         */
        this.menus = this.options.menuSelector ? document.querySelectorAll(this.options.menuSelector) : null;

        this.close = this.options.closeSelector ? document.querySelectorAll(this.options.closeSelector) : null;

        this.overlay = this.options.overlaySelector ? document.querySelector(this.options.overlaySelector) : null;

        this.menuBurger = this.options.menuBurgerSelector ? document.querySelector(this.options.menuBurgerSelector) : null;
        this.menuMobile = this.options.menuMobileSelector ? document.querySelector(this.options.menuMobileSelector) : null;

        this.menuBurgerLabel = this.options.menuBurgerLabelSelector ? document.querySelector(this.options.menuBurgerLabelSelector) : null;
        this.menuBurgerLabelOpen = this.menuBurgerLabel ? this.menuBurgerLabel.innerHTML : '';
        this.menuBurgerLabelClose = this.menuBurgerLabel  ? this.menuBurgerLabel.getAttribute(this._getAttribute(this.options.menuBurgerLabelSelector)) : '';

        this.search = this.options.searchSelector ? document.querySelector(this.options.searchSelector) : null;
        this.openSearch = this.search && this.options.searchOpenSelector ? document.querySelectorAll(this.options.searchOpenSelector) : null;
        this.closeSearch = this.search && this.options.searchCloseSelector ? document.querySelectorAll(this.options.searchCloseSelector) : null;
        this.searchForm = this.search ? this.search.querySelector('form') : null;
        this.searchInput = this.searchForm ? this.searchForm.querySelector('input[type=text]') : null;

        this.skipLinks = this.options.skipLinksSelector ? document.querySelector(this.options.skipLinksSelector) : null;

        this.noLinks = this.options.noLinkSelector ? document.querySelectorAll(this.options.noLinkSelector) : null;

        this.body = document.body;

        this.menusObj = [];
        this.submenusObj = [];

        this.prevLink = null;
        this.firstLink = null;
        this.currentSubmenu = null;

        this.menuMobileOpen = false;

        this.openSubmenu = false;
        this.shiftTab = false;
        this.tab = false;
        this.clicked = true;

        this.lastOpenSearch = null;

        this.originalBreakpoint = this._isMobile();

    }

    /**
     * *******************************************************
     * Initializing
     * *******************************************************
     */
    init() {

        // handle menu burger
        if(this.menuBurger && this.menuMobile){
            this._handleMenuBurger();
        }

        // close menu if we scroll on the page
        if(this.options.closeMenuOnScroll){
            document.addEventListener('scroll', () => {
                if(this.currentSubmenu && !this.body.classList.contains('menu-is-opening') && !this._isMobile() && !this._isTouchable()){
                    this._closeMenu();
                }
            });
        }

        // add listener close for every closing elements in the DOM
        if(this.close){
            this.close.forEach((el) => {
                el.addEventListener("click", (e) => {
                    e.preventDefault();
                    this._closeMenu();
                });
            });
        }

        // add listener to prevent opening links
        if(this.noLinks){
            this.noLinks.forEach((el) => {
                el.addEventListener("click", (e) => {
                    e.preventDefault();
                });
            });
        }

        this._initSkipLinks();

        // handle search
        if(this.search && this.openSearch){
            this._handleSearch();
        }

        if(this._isTouchable() && !this._isMobile()){
            document.addEventListener('click', (e) => {
                const target = e.target;
                if(this.currentSubmenu && target !== this.currentSubmenu && !getClosest(target, this.options.submenuSelector)){
                    this._closeMenu();
                }
            });
        }

        if(this.options.accessibility && !this._isMobile()){
            // close submenu if it's last link
            document.addEventListener('focusin', (e) => {
                if(this.currentSubmenu && !e.target.hasAttribute(this._getAttribute(this.options.linkSelector)) && !getClosest(e.target, this.options.submenuSelector)){
                    this._closeMenu();
                }
            });
        }

        // handle sticky with responsive callback
        this._handleResponsive(() => {
            this._closeMenu();
            this._initSticky();
            this._initMenu();
        });
        
    }

    /**
     * *******************************************************
     * Init skip links
     * *******************************************************
     */
    _initSkipLinks() {
        if(this.skipLinks){
            const skipLinks = this.skipLinks.querySelectorAll('a');
            if(skipLinks){
                skipLinks.forEach((link) => {
                    link.addEventListener('focus', () => {
                        this.skipLinks.classList.add('is-visible');
                    });
                    link.addEventListener('focusout', (e) => {
                        const parent = getClosest(e.relatedTarget, this.options.skipLinksSelector);
                        if(!parent){
                            this.skipLinks.classList.remove('is-visible');
                        }
                    });
                });
            }
        }
    }

    /**
     * *******************************************************
     * Init sticky
     * *******************************************************
     */
    _initSticky() {
        if(this.options.stickySelector || this.options.stickyMobileSelector){

            let sticky = null;

            if(this._isMobile() && this.options.stickyMobileSelector){
                sticky = document.querySelectorAll(this.options.stickyMobileSelector);
            }
            else if(document.querySelectorAll(this.options.stickySelector)){
                sticky = document.querySelectorAll(this.options.stickySelector);
            }

            if(sticky){
                sticky.forEach((el) => {
                    this._handleSticky(el);
                });
            }

        }
    }

    /**
     * *******************************************************
     * Init all menus
     * *******************************************************
     */
    _initMenu() {
        // Parse each menu and found links
        if(this.menus && this.options.linkSelector){
            this.menus.forEach((menu, index) => {
                const menuItem = new MenuItem(this, menu);
                menuItem.init();
                this.menusObj.push(menuItem);
                if(menu.hasAttribute(this._getAttribute(this.options.equalizeHeightSelector))){
                    this.submenusObj[index] = menuItem.submenus;
                }
            });
            this._equalizeHeight();
        }
    }

    /**
     * *******************************************************
     * Open menu
     * *******************************************************
     */
    _openMenu(el, linkFirstLevel=null){

        const alreadyOpen = this.currentSubmenu;

        if(linkFirstLevel){
            this.firstLink = linkFirstLevel;
        }

        if(!alreadyOpen){
            this.body.classList.add('menu-is-open');
            this.body.classList.add('menu-is-opening');
            this.body.classList.add('submenu-is-open');
            this.body.classList.add('submenu-is-opening');
        }
        else{
            this.body.classList.add('submenu-is-changing');
        }

        this.currentSubmenu = el.submenu;

        this.currentSubmenu.classList.add('is-active');
        this.currentSubmenu.classList.add('is-open');
        this.currentSubmenu.classList.add('is-opening');

        el.link.classList.add('is-active');

        if(this.options.accessibility) {
            this.currentSubmenu.setAttribute("aria-expanded", true);
            this.currentSubmenu.setAttribute("aria-hidden", false);
            el.link.setAttribute("aria-expanded", true);
        }

        if(this.overlay && !alreadyOpen){
            this.overlay.classList.add('is-visible');
        }

        if(alreadyOpen){
            this.emit("before_open_submenu", {
                link: el.link,
                submenu: this.currentSubmenu
            });
            this._endAnimation( () => {
                if(this.currentSubmenu){
                    this.currentSubmenu.classList.remove('is-opening');
                }
                this.body.classList.remove('submenu-is-changing');
                this.emit("after_open_submenu", {
                    link: el.link,
                    submenu: this.currentSubmenu
                });
            });
        }
        else{
            this.emit("before_open_menu", {
                link: el.link,
                submenu: this.currentSubmenu
            });
            this._endAnimation(() => {
                this.currentSubmenu.classList.remove('is-opening');
                this.body.classList.remove('menu-is-opening');
                this.body.classList.remove('submenu-is-opening');
                this.emit("after_open_menu", {
                    link: el.link,
                    submenu: this.currentSubmenu
                });
            });
        }

    }

    /**
     * *******************************************************
     * Close all submenus
     * *******************************************************
     */
    _closeMenu(){
        if(this.menuMobileOpen){
            this._closeMobileMenu();
        }
        else if(this.currentSubmenu){
            this._handleClose();
        }
    }

    /**
     * *******************************************************
     * Open menu on mobile
     * *******************************************************
     */
    _openMobileMenu(){
        this.menuMobileOpen = true;

        this.menuMobile.classList.add('is-open');
        this.menuMobile.classList.add('is-opening');
        this.menuBurger.classList.add('is-active');

        if(this.overlay) {
            this.overlay.classList.add('is-visible');
        }
        if(this.menuBurgerLabel){
            this.menuBurgerLabel.innerHTML = this.menuBurgerLabelClose;
        }

        this.body.classList.add('menu-is-open');
        this.body.classList.add('menu-is-opening');

        this.emit("before_open_menu_mobile");

        this._endAnimation(() => {
            this.body.classList.remove('menu-is-opening');
            this.menuMobile.classList.remove('is-opening');
            this.emit("after_open_menu_mobile");
        });

    }

    /**
     * *******************************************************
     * Close menu on mobile
     * *******************************************************
     */
    _closeMobileMenu(){
        this.menuMobileOpen = false;
        this.menuMobile.classList.remove('is-open');
        this.menuBurger.classList.remove('is-active');
        if(this.overlay) {
            this.overlay.classList.remove('is-visible');
        }
        if(this.menuBurgerLabel){
            this.menuBurgerLabel.innerHTML = this.menuBurgerLabelOpen;
        }
        this._handleClose();
    }

    /**
     * *******************************************************
     * Close current submenu
     * *******************************************************
     */
    _previousSubmenu(parentSubmenu, link, setFocus=false){

        this.currentSubmenu.classList.remove('is-active');
        this.currentSubmenu.classList.remove('is-open');
        this.currentSubmenu.classList.add('is-closing');

        if(this.options.accessibility) {
            this.currentSubmenu.setAttribute("aria-expanded", false);
            this.currentSubmenu.setAttribute("aria-hidden", true);
        }

        link.classList.remove('is-active');
        if(this.options.accessibility) {
            link.setAttribute("aria-expanded", false);
            link.setAttribute("aria-hidden", true);
        }

        if(parentSubmenu){
            this.currentSubmenu = parentSubmenu;
            this.currentSubmenu.classList.add('is-active');

            this.emit('before_previous_submenu', {
                submenu: this.currentSubmenu
            });

            this._endAnimation(() => {
                this.currentSubmenu.classList.remove('is-closing');
                this.emit('after_previous_submenu', {
                    submenu: this.currentSubmenu
                });
            });
        }
        else {
            this.body.classList.add('submenu-is-closing');
            this.currentSubmenu = null;
            this._endAnimation(() => {
                this.body.classList.remove('submenu-is-open');
                this.body.classList.remove('submenu-is-closing');
            });
        }

        if(setFocus){
            link.focus();
        }

    }

    /**
     * *******************************************************
     * Change menu
     * *******************************************************
     */
    _changeMenu(){
        this._handleClose(true);
    }

    /**
     * *******************************************************
     * Remove focus class
     * *******************************************************
     */
    _removeFocus(){
        if(this.prevLink){
            this.prevLink.link.classList.remove('is-focus');
        }
    }

    /**
     * *******************************************************
     * Handle close
     * *******************************************************
     */
    _handleClose(changeMenu=false){

        const submenusOpen = document.querySelectorAll(this.options.submenuSelector + '.is-open');

        submenusOpen.forEach((el) => {
            el.classList.remove('is-active');
            el.classList.remove('is-open');
            el.classList.add('is-closing');
            if(this.options.accessibility) {
                el.setAttribute("aria-expanded", false);
                el.setAttribute("aria-hidden", true);
            }
        });

        const linksActive = document.querySelectorAll(this.options.linkSelector + '.is-active');

        linksActive.forEach((link) => {
            link.classList.remove('is-active');
            if(this.options.accessibility) {
                link.setAttribute("aria-expanded", false);
            }
        });

        if(this.overlay && !changeMenu){
            this.overlay.classList.remove('is-visible');
        }

        if(!changeMenu){
            this.emit('before_close_menu');

            this.body.classList.remove('menu-is-open');
            this.body.classList.remove('submenu-is-open');

            this.body.classList.add('menu-is-closing');
            this.body.classList.add('submenu-is-closing');

        }
        else{
            this.emit('before_change_menu', {
                submenu: this.currentSubmenu
            });
        }

        this._endAnimation(() => {
            submenusOpen.forEach((el) => {
                el.classList.remove('is-closing');
            });
            this.body.classList.remove('submenu-is-closing');
            if(!changeMenu){
                this.body.classList.remove('menu-is-closing');
                this.currentSubmenu = null;
                this.emit('after_close_menu');
            }
            else{
                this.emit('after_change_menu', {
                    submenu: this.currentSubmenu
                });
            }
        });

    }

    /**
     * *******************************************************
     * Menu burger
     * *******************************************************
     */
    _handleMenuBurger(){
        this.menuBurger.addEventListener('click', (e) => {
            e.preventDefault();
            if(!this.menuMobile.classList.contains('is-open')){
                this._openMobileMenu();
            }
            else{
                this._closeMobileMenu();
            }
        });
    }

    /**
     * *******************************************************
     * Handle sticky
     * *******************************************************
     */
    _handleSticky(element){

        this.sticky = element;

        if(this._isMobile()){
            if(this.sticky){
                this.sticky.classList.remove('sticky');
                this.sticky.classList.remove('sticky-up');
                this.sticky.classList.remove('scroll');
                this.sticky.classList.remove('scroll--up');
                this.sticky.classList.remove('scroll--down');
                this.body.classList.remove('header-is-sticky');
                this.body.classList.remove('scroll--up');
                this.body.classList.remove('scroll--down');
            }
            this.sticky = document.querySelector(this.options.stickyMobileSelector);
        }
        else{
            this.sticky = document.querySelector(this.options.stickySelector);
        }

        if(!this.sticky){
            return;
        }

        let lastScrollTop = 0;

        document.addEventListener('scroll', () => {

            let st = window.pageYOffset || document.documentElement.scrollTop;

            this.emit('scroll', {
                scrollTop: st,
                lastScrollTop: lastScrollTop
            });

            if(this.menuMobileOpen){
                return;
            }

            if(st > this.sticky.clientHeight + this.options.stickyOffset){
                this.body.classList.add('header-is-sticky');
                if(!this.options.stickyScrollTop){
                    this.sticky.classList.add('sticky');
                    this.body.style.paddingTop = this.sticky.clientHeight + "px";
                    this.emit('sticky-in', {
                        sticky: this.sticky,
                        scrollTop: st,
                        lastScrollTop: lastScrollTop
                    });
                }
                else{
                    this.sticky.classList.add('sticky-up');
                    if (st > lastScrollTop) {
                        if(!this.sticky.classList.contains('scroll--down')){
                            this.body.classList.add('scroll--down');
                            this.body.classList.remove('scroll--up');
                            this.sticky.classList.add('scroll--down');
                            this.sticky.classList.remove('scroll--up');
                            this.body.style.paddingTop = this.sticky.clientHeight + "px";
                            setTimeout(() => {
                                this.sticky.classList.add('scroll');
                            }, 50);
                            this.emit('sticky-out',{
                                sticky: this.sticky,
                                scrollTop: st,
                                lastScrollTop: lastScrollTop
                            });
                        }
                    }
                    else{
                        if(!this.sticky.classList.contains('scroll--up')){
                            this.body.classList.add('scroll--up');
                            this.body.classList.remove('scroll--down');
                            this.sticky.classList.add('scroll--up');
                            this.sticky.classList.remove('scroll--down');
                            this.emit('sticky-in', {
                                sticky: this.sticky,
                                scrollTop: st,
                                lastScrollTop: lastScrollTop
                            });
                        }
                    }
                }
            }

            if(st < 2){
                this.body.style.paddingTop = 0;
                if(this.options.stickyScrollTop){
                    this.sticky.classList.remove('sticky-up');
                    this.sticky.classList.remove('scroll--up');
                    this.sticky.classList.remove('scroll');
                    this.body.classList.remove('scroll--up');
                }
                else{
                    this.sticky.classList.remove('sticky');
                }
                this.body.classList.remove('header-is-sticky');
                this.emit('sticky-out',{
                    sticky: this.sticky,
                    scrollTop: st,
                    lastScrollTop: lastScrollTop
                });
            }

            lastScrollTop = st <= 0 ? 0 : st;

        });
    }

    /**
     * *******************************************************
     * Handle search
     * *******************************************************
     */
    _handleSearch(){
        this.openSearch.forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.lastOpenSearch = el;
                this._openSearch();
            });
        });
        this.closeSearch.forEach((el) => {
            el.addEventListener('click', (e) => {
                if (e.target !== el){
                    return;
                }
                this._closeSearch();
                e.preventDefault();
                e.stopPropagation();
            });
        });
        this.search.addEventListener('keyup', (e) => {
            if(e.keyCode == 27) {
                this.lastOpenSearch.focus();
                this._closeSearch();
            }
        });
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this._submitSearch();
        });
        this.searchInput.addEventListener('input', (e) => {
            if(e.target.value.trim().length){
                this.searchInput.classList.remove('error');
            }
        });
    }

    /**
     * *******************************************************
     * Submit Search
     * *******************************************************
     */
    _submitSearch(){
        const value = this.searchInput.value;
        if(value.trim().length){
            this.emit('search_submit', {
                search: this.search,
                form: this.searchForm,
                inputValue: value.trim()
            });
        }
        else{
            this.searchInput.classList.add('error');
        }
    }

    /**
     * *******************************************************
     * Open search
     * *******************************************************
     */
    _openSearch(){
        this.body.classList.add('search-is-open');
        this.search.classList.add('is-open');
        if(this.searchInput){
            setTimeout(() => {
                this.searchInput.focus();
            }, 500);
        }
        this.emit('search_open', {
            search: this.search,
            form: this.searchForm
        });
    }

    /**
     * *******************************************************
     * Close search
     * *******************************************************
     */
    _closeSearch(){
        this.lastOpenSearch = null;
        this.body.classList.remove('search-is-open');
        this.search.classList.remove('is-open');
        this.emit('search_close', {
            search: this.search,
            form: this.searchForm
        });
    }

    /**
     * *******************************************************
     * Set same height for all submenus of a menu
     * *******************************************************
     */
    _equalizeHeight() {
        if(this.submenusObj.length && !this._isMobile()){
            this.submenusObj.forEach((subArray) => {
                if(subArray && subArray.length){
                    const heighest = getHeighestElement(subArray);
                    subArray.forEach((el) => {
                        el.style.height = heighest + "px";
                    });
                }
            });
        }
    }

    /**
     * *******************************************************
     * Test responsive mobile
     * *******************************************************
     */
    _isMobile(){
        if(window.innerWidth <= this.options.responsiveBreakpoint){
            return true;
        }
        return false;
    }

    /**
     * *******************************************************
     * Test if device is touchable
     * *******************************************************
     */
    _isTouchable(){
        const isTouchable = !!('ontouchstart' in window);
        return isTouchable;
    }

    /**
     * *******************************************************
     * Return attribute without [ ]
     * *******************************************************
     */
    _getAttribute(selector){
        return selector.replace('[', '').replace(']', '');
    }

    /**
     * *******************************************************
     * Function on resize with debounce
     * *******************************************************
     */
    _handleResponsive(callback){
        callback();
        let resizeTimer;
        window.onresize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if(this.originalBreakpoint !== this._isMobile()){
                    callback();
                    this.originalBreakpoint = this._isMobile();
                }
            }, 200);
        };
    }

    /**
     * *******************************************************
     * Detect end animation
     * *******************************************************
     */
    _endAnimation(callback = () => {}, timeout = this.options.openingTime){
        setTimeout(() => {
            if(typeof callback === "function"){
                callback();
            }
        }, timeout);
    }

}
