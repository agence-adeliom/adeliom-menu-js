import MenuBackLink from "./_MenuBackLink";
import MenuLink from "./_MenuLink";
import {getClosestChildren} from 'dauphine-js';

export default class MenuItem {

    constructor(domNode, menu){
        this.menu = menu;
        this.domNode = domNode;
        this.links = [];
        this.submenus = [];
        this.firstLink = null;
        this.lastLink = null;
        this.firstChars = [];
    }

    init(){

        const children = getClosestChildren(this.menu, this.domNode.options.parentSelector);

        if(children && children.length){
            children.forEach((parentLink) => {

                const link = parentLink.querySelector(this.domNode.options.linkSelector);
                const allLinks = parentLink.querySelectorAll(this.domNode.options.linkSelector);

                let submenu = null;

                if(parentLink.hasAttribute(this.domNode._getAttribute(this.domNode.options.parentSubmenuSelector))) {

                    if(this.domNode.options.selectByDataAttribute){
                        const id = link.dataset.id;
                        if(id){
                            const level = id.split('-');
                            if(level.length){
                                submenu = document.querySelector(this.domNode.options.submenuSelector + '[data-id="'+ id +'"]');
                            }
                        }
                    }
                    else{
                        submenu = parentLink.querySelector(this.domNode.options.submenuSelector);
                    }

                }

                const linkElement = new MenuLink(this.domNode, this, link, parentLink, submenu);

                if(this.domNode.options.accessibility) {
                    linkElement.initAccessibility();
                }

                if(submenu){

                    this.submenus.push(submenu);

                    linkElement.initSubmenu();

                    if(this.domNode.options.backSelector){
                        const backLink = submenu.querySelector(this.domNode.options.backSelector);
                        if(backLink){
                            const backLinkElement = new MenuBackLink(this.domNode, backLink, link, parentLink);
                            backLinkElement.init();
                        }
                    }
                }

                this.links.push(link);

                const textContent = link.textContent.trim();
                this.firstChars.push(textContent.substring(0, 1).toLowerCase());

            });

            // Set first and last link from array links
            this.firstLink = this.links[0];
            this.lastLink = this.links[this.links.length - 1];
        }
    }

    /**
     * *******************************************************
     * Set focus on first link
     * *******************************************************
     */
    _setFocusFirstLink(){
        this.firstLink.focus();
    }

    /**
     * *******************************************************
     * Set focus on last link
     * *******************************************************
     */
    _setFocusLastLink(){
        this.lastLink.focus();
    };

    /**
     * *******************************************************
     * Test if it's last link
     * *******************************************************
     */
    _isLastLink(link){
        return link === this.lastLink;
    };

    /**
     * *******************************************************
     * Go to next link
     * *******************************************************
     */
    _goToNext(currentLink){
        // If focus is on the last item, moves focus to the first item
        const link = this.links[this._getCurrentIndex(currentLink) + 1] || this.firstLink;
        link.focus();
        if(link !== document.activeElement){
            this._goToNext(link);
        }
    };

    /**
     * *******************************************************
     * Go to prev link
     * *******************************************************
     */
    _goToPrev(currentLink){
        // If focus is on the first item, moves focus to the last item
        const link = this.links[this._getCurrentIndex(currentLink) - 1] || this.lastLink;
        link.focus();
        if(link !== document.activeElement){
            this._goToPrev(link);
        }
    };

    /**
     * *******************************************************
     * Return current index of the link
     * *******************************************************
     */
    _getCurrentIndex(currentLink){
        const array = Array.prototype.slice.call(this.links);
        return array.indexOf(currentLink);
    };

    /**
     * *******************************************************
     * Set focus with first character
     * *******************************************************
     */
    _setFocusByFirstCharacter(link, char){

        char = char.toLowerCase();

        // Get start index for search based on position of currentItem
        let start = this.links.indexOf(link) + 1;

        if (start === this.links.length) {
            start = 0;
        }

        // Check remaining slots in the menu
        let index = this._getIndexFirstChars(start, char);

        // If not found in remaining slots, check from beginning
        if (index === -1) {
            index = this._getIndexFirstChars(0, char);
        }

        // If match was found...
        if (index > -1) {
            this.links[index].focus();
        }
    };

    /**
     * *******************************************************
     * Get index with first character
     * *******************************************************
     */
    _getIndexFirstChars(startIndex, char) {
        for (let i = startIndex; i < this.firstChars.length; i++) {
            if (char === this.firstChars[ i ]) {
                return i;
            }
        }
        return -1;
    };

}
