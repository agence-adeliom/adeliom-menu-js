import {getClosest} from 'dauphine-js';

export default class MenuLink {

    constructor(domNode, menu, link, parentLink, submenu){

        this.menu = menu;
        this.domNode = domNode;

        this.link = link;
        this.parentLink = parentLink;
        this.submenu = submenu;

        this.parentSubmenu = null;
        this.oldParent = null;

        this.keyCode = Object.freeze({
            'TAB': 9,
            'RETURN': 13,
            'ESC': 27,
            'SPACE': 32,
            'PAGEUP': 33,
            'PAGEDOWN': 34,
            'END': 35,
            'HOME': 36,
            'LEFT': 37,
            'UP': 38,
            'RIGHT': 39,
            'DOWN': 40
        });
    };

    /**
     * *******************************************************
     * Init submenu
     * *******************************************************
     */
    initSubmenu(){

        const eventAttribute = this.link.getAttribute(this.domNode._getAttribute(this.domNode.options.eventSelector));
        const eventType = this.domNode._isMobile() || this.domNode._isTouchable() ? 'click' : eventAttribute ? eventAttribute : 'click';

        const link = eventType === 'mouseenter' ? this.parentLink : this.link;

        if(eventType === 'mouseenter') {
            link.removeEventListener("mouseleave", (e) => this._onMouseLeave(e));
            link.addEventListener("mouseleave", (e) => this._onMouseLeave(e));
        }

        link.removeEventListener(eventType, (e) => this._openEvent(e, eventType));
        link.addEventListener(eventType, (e) => this._openEvent(e, eventType));

    }

    /**
     * *******************************************************
     * Event for opening submenu
     * *******************************************************
     */
    _openEvent(e, eventType) {

        e.preventDefault();
        e.stopPropagation();

        // if submenu is already open and same link is clicked
        if(eventType === 'click' && this.link.classList.contains('is-active')){
            this.domNode._closeMenu();
            return;
        }

        // if a submenu is already open, remove the active class on previous submenu
        if(this.domNode.currentSubmenu){
            this.domNode.currentSubmenu.classList.remove('is-active');
        }

        // if a submenu is already open and link is on first level
        if(this.domNode.currentSubmenu && this._isFirstLevel()){
            this.domNode._changeMenu();
        }

        this._openSubmenu();
    }

    /**
     * *******************************************************
     * Mouse leave listener for closing menu
     * *******************************************************
     */
    _onMouseLeave(e) {
        const relatedTarget = e.relatedTarget;
        const parentLinkAttribute = this.domNode._getAttribute(this.domNode.options.parentSelector);
        const linkAttribute = this.domNode._getAttribute(this.domNode.options.linkSelector);

        if(relatedTarget && (relatedTarget.hasAttribute(parentLinkAttribute) || relatedTarget.hasAttribute(linkAttribute))){
            this.domNode._changeMenu();
        }
        else{
            this.domNode._closeMenu();
        }
    }

    /**
     * *******************************************************
     * Navigation keyboard
     * *******************************************************
     */
    initAccessibility(){

        this.link.addEventListener('blur', () => {
            this.domNode._removeFocus();
        });

        this.link.addEventListener('click', () => {
            this.domNode.clicked = true;
            this.domNode._removeFocus();
        });

        this.link.addEventListener('focus', (event) => {

            if(!this.domNode.clicked){

                this.link.classList.add('is-focus');

                if(this.domNode.shiftTab && !this._isFirstLevel() && this.submenu && this.submenu.classList.contains('is-active')){
                    this.domNode._previousSubmenu(this._getParentSubmenu(), this.link);
                    this.domNode.shiftTab = false;
                }

                // if(this.domNode.tab && this.domNode.prevLink && this.domNode.prevLink.submenu && this.domNode.prevLink.submenu.classList.contains('is-active')){
                //     console.log('need to close');
                //     this.domNode.tab = false;
                // }

                if(this._isFirstLevel() && !this.submenu){
                    this.domNode.openSubmenu = false;
                }

                if(this._isFirstLevel() && this.domNode.currentSubmenu){
                    this.domNode._closeMenu();
                }

                if(this._isFirstLevel() && this.domNode.openSubmenu){
                    this._openSubmenu();
                }

                this.domNode.prevLink = this;

            }

        });

        this.link.addEventListener("keydown", event => {

            this.domNode.clicked = false;

            switch (event.keyCode) {

                case this.keyCode.HOME:
                    // 	Moves focus to first item
                    event.preventDefault();
                    this.menu._setFocusFirstLink();
                    break;

                case this.keyCode.END:
                    // Moves focus to last item
                    event.preventDefault();
                    this.menu._setFocusLastLink();
                    break;

                case this.keyCode.UP:
                    event.preventDefault();
                    // Opens submenu and moves focus to last item in the submenu
                    if(this._isFirstLevel()){
                        this._setFocusLastLinkSubmenu();
                    }
                    // Moves focus to previous item in the submenu
                    else{
                        this.menu._goToPrev(this.link);
                    }
                    break;

                case this.keyCode.SPACE:
                case this.keyCode.RETURN:
                case this.keyCode.DOWN:
                    if(event.keyCode === this.keyCode.RETURN && event.target.href && event.target.getAttribute("href").charAt(0) !== "#"){
                        return;
                    }
                    else{
                        event.preventDefault();
                    }
                    // Opens submenu and moves focus to first item in the submenu
                    if(this._isFirstLevel()){
                        this._setFocusFirstLinkSubmenu();
                    }
                    // Moves focus to the next item in the submenu
                    else if(event.keyCode === this.keyCode.DOWN){
                        this.menu._goToNext(this.link);
                    }
                    break;

                case this.keyCode.LEFT:
                    // Moves focus to the next item
                    if(this._isFirstLevel()){
                        this.menu._goToPrev(this.link);
                    }
                    else{
                        if(this._isSecondLevel()){
                            this.domNode._previousSubmenu(this._getParentSubmenu(), this.link);
                            this._setFocusNextParentLink('prev', true);
                        }
                        // If parent menu item is in the menubar
                        else{
                            // Closes submenu and moves focus to parent menu item
                            this.domNode._closeMenu();
                            this._setFocusNextParentLink('prev');
                        }
                    }
                    break;

                case this.keyCode.RIGHT:
                    // Moves focus to the next item
                    if(this._isFirstLevel()){
                        this.menu._goToNext(this.link);
                    }
                    else{
                        // If focus is on an item with a submenu, opens the submenu and places focus on the first item
                        if(this.submenu){
                            this._setFocusFirstLinkSubmenu();
                        }
                        // If focus is on an item that does not have a submenu
                        else{
                            if(this._isSecondLevel()){
                                // Close current submenu and move focus to parent item
                                this.domNode._previousSubmenu(this._getParentSubmenu(), this.link);
                                this._setFocusNextParentLink('next', true);
                            }
                            else{
                                // Close submenu and move focus to next item in the menubar
                                this.domNode._closeMenu();
                                this._setFocusNextParentLink('next');
                            }

                        }
                    }

                    break;

                case this.keyCode.TAB:
                    // Shift + Tab
                    if(event.shiftKey){
                        this.domNode.shiftTab = true;
                        return;
                    }
                    if(this._isSecondLevel()){
                        this.domNode.tab = true;
                    }
                    this.domNode.openSubmenu = false;
                    break;

                case this.keyCode.ESC:
                    // Closes submenu and moves focus to parent menubar item
                    if(this.domNode.currentSubmenu){
                        this.domNode._closeMenu();
                        if(this.domNode.firstLink){
                            this.domNode.firstLink.focus();
                        }
                    }
                    break;

                default:
                    if (this._isPrintableCharacter(event.key)) {
                        this.menu._setFocusByFirstCharacter(this.link, event.key);
                    }
                    break;
            }

        });
    }

    /**
     * *******************************************************
     * Open Submenu
     * *******************************************************
     */
    _openSubmenu(){
        if(this.submenu){
            const link = this._isFirstLevel() ? this.link : null;
            this.domNode._openMenu(this, link);
        }
    }

    /**
     * *******************************************************
     * Get parent submenu
     * *******************************************************
     */
    _getParentSubmenu(){
        this.parentSubmenu = this.parentSubmenu || getClosest(this.parentLink, this.domNode.options.submenuSelector);
    }

    /**
     * *******************************************************
     * Get parent submenu to test if link is on first level
     * *******************************************************
     */
    _isFirstLevel(){
        if(this.domNode.options.selectByDataAttribute){
            const id = this.link.dataset.id;
            if(id){
                const level = id.split('-');
                if(level.length && level[0] === "0"){
                    return true;
                }
            }
            return false;
        }
        else{
            this._getParentSubmenu();
            return this.parentSubmenu ? false : true;
        }
    }

    /**
     * *******************************************************
     * Get old parent
     * *******************************************************
     */
    _isSecondLevel(){
        this._getParentSubmenu();
        this.oldParent = this.parentSubmenu ? this.oldParent || getClosest(this.parentSubmenu, this.domNode.options.submenuSelector) : false;
        return this.oldParent ? true : false;
    }

    /**
     * *******************************************************
     * Set focus on first submenu's link
     * *******************************************************
     */
    _setFocusFirstLinkSubmenu(){
        if(this.submenu){
            this._openSubmenu();
            const firstLink = this.submenu.querySelector(this.domNode.options.linkSelector);
            if(firstLink){
                setTimeout(() => {
                    firstLink.focus();
                }, 100);
            }
        }
    }

    /**
     * *******************************************************
     * Set focus on last submenu's link
     * *******************************************************
     */
    _setFocusLastLinkSubmenu(){
        if(this.submenu){
            this._openSubmenu();
            const links = this.submenu.querySelectorAll(this.domNode.options.linkSelector);
            const lastLink = links[links.length - 1];
            if(lastLink){
                setTimeout(() => {
                    lastLink.focus();
                }, 50);
            }
        }
    }

    /**
     * *******************************************************
     * Set focus on next parent's link
     * *******************************************************
     */
    _setFocusNextParentLink(direction, submenu=false){
        const parentLink = getClosest(this.parentLink, this.domNode.options.parentSubmenuSelector);
        if(parentLink){

            const menu = getClosest(parentLink, this.domNode.options.menuSelector);
            const array = Array.prototype.slice.call(menu.children);

            const index = array.indexOf(parentLink);

            let nextParentLink = null;

            if(submenu){
                nextParentLink = array[index];
            }
            else{
                if(direction === "next"){
                    nextParentLink = array[index + 1] || array[0];
                }
                else{
                    nextParentLink = array[index - 1] || array[array.length - 1];
                }
                this.domNode.openSubmenu = true;
            }

            nextParentLink.querySelector(this.domNode.options.linkSelector).focus();

        }
    }

    /**
     * *******************************************************
     * Test if is good character
     * *******************************************************
     */
    _isPrintableCharacter(str){
        return str.length === 1 && str.match(/\S/);
    }

}
