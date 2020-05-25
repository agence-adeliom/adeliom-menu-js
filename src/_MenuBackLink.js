import {getClosest} from 'dauphine-js';

export default class MenuBackLink {

    constructor(domNode, backLink, link, parentLink){
        this.domNode = domNode;
        this.backLink = backLink;
        this.link = link;
        this.parentLink = parentLink;
        this.parentSubmenu = null;
        this.currentKey=  null;
    }

    init(){
        this.backLink.addEventListener('click', (e) => {

            e.preventDefault();

            if(this.domNode.options.selectByDataAttribute) {
                const id = this.backLink.dataset.id;
                let oldId = id.split('-');
                if(oldId.length){
                    oldId = (oldId[0] - 1) + '-' + oldId[1];
                    this.parentSubmenu = this.parentSubmenu || document.querySelector(this.domNode.options.submenuSelector + '[data-id="'+ oldId +'"]');
                }
            }
            else{
                this.parentSubmenu = this.parentSubmenu || getClosest(this.parentLink, this.domNode.options.submenuSelector);
            }

            this.domNode._previousSubmenu(this.parentSubmenu, this.link, this.currentKey ? true : false);

        });

        this.backLink.addEventListener("keydown", (event) => {
            this.currentKey = event.which;
        });

        this.backLink.addEventListener("keyup", (event) => {
            this.currentKey = null;
        });

    }
}
