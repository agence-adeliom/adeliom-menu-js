# Installation
```
yarn add https://bitbucket.org/adeliomgit/adeliom-menu-js.git
```

# Import
```
import Menu from 'adeliom-menu-js';
```

# Options disponibles (par défaut)

```
const settings = {

    'menuSelector': '[js-menu]', => à appliquer sur les menus de type <ul>
    'equalizeHeightSelector': '[js-menu-equalizeheight]', => à appliquer sur 'menuSelector', pour avoir une hauteur de sous-menu basée sur la plus grande des hauteurs

    'parentSelector': '[js-menu-item]', => à appliquer au parent du lien, donc généralement sur le <li>
    'parentSubmenuSelector': '[js-menu-haschildren]', => à appliquer sur le même élément que 'parentSelector'

    'linkSelector': '[js-menu-link]', => à appliquer sur les liens de type <a>
    'noLinkSelector': '[js-menu-nolink]', => à appliquer sur le <a> pour empêcher les événements (click etc.)

    'submenuSelector': '[js-menu-sublevel]', => à appliquer sur un élément qui se trouve généralement dans le <li>

    'eventSelector': '[js-menu-event]', => type d'événement, par défaut : click, possible de surcharger avec mouseenter

    'closeSelector': '[js-menu-close]', => à appliquer sur les éléments pour fermer le menu, à appliquer sur l'overlay également

    'overlaySelector': '[js-menu-overlay]', => selecteur de l'overlay, pas de fermeture auto, appliquer le selecteur 'closeSelector'

    'backSelector': '[js-menu-back]', => à appliquer sur le lien de retour, dans les sous-menus

    'searchSelector': '[js-search]', => à appliquer sur l'élément de recherche, une modal par exemple
    'searchOpenSelector': '[js-search-open]', => à appliquer sur l'élément d'ouverture de la recherche
    'searchCloseSelector': '[js-search-close]', => à appliquer sur l'élément de fermeture de la recherche

    'menuBurgerSelector': '[js-menu-burger]', => à appliquer sur le menu burger pour l'ouverture du menu mobile
    'menuBurgerLabelSelector': '[js-menu-burger-label]', => à appliquer dans le cas où l'on a un label "Ouvrir" / "Fermer"

    'menuMobileSelector': '[js-menu-mobile]', => à appliquer sur l'élément principal qui doit s'ouvrir sur mobile

    'stickySelector': '[js-menu-sticky]', => à appliquer sur l'élément sticky, généralement le header
    'stickyMobileSelector': '[js-menu-sticky-mobile]', => à appliquer sur l'élément sticky mobile, qui peut être le même ou différent que sur Desktop
    'stickyOffset': 300, => apparition du sticky, à partir de X px
    'stickyScrollTop': false, => gestion du sticky uniquement au scroll up

    'skipLinksSelector': '[js-menu-skip-links]', => à appliquer sur l'élément parent qui contient les liens "d'évitements" 

    'closeMenuOnScroll': false, => fermeture du menu au scroll

    'selectByDataAttribute': false, => BETA : gestion des selecteurs avec des identifiants, pour structurer différement le menu

    'responsiveBreakpoint': 1280, => passage au menu mobile

    'accessibility': true, => gestion de l'accessibilité, navigation TAB + flèches etc.

    'openingTime': 250 => durée de transition pour l'ouverture / fermeture du menu et sous-menus

};
```

# Initialisation
```
const menu = new Menu(settings);
menu.init();
```

# Exemples HTML
```
<header js-menu-sticky js-menu-sticky-mobile> 

    <nav js-menu-mobile>
        <ul js-menu>
        
            <li js-menu-item>
                <a href="#" js-menu-link>Exemple</a>    
            </li>
    
            <li js-menu-item js-menu-haschildren>
    
                <a href="#" js-menu-link>Exemple with submenu</a>
    
                <div js-menu-submenu>
                    <div js-menu-back>Back</div> => le lien de retour doit être géré dans le HTML
                    <div class="content">
                        <ul js-menu>
                            <li js-menu-item>
                                <a href="#" js-menu-link>Other link</a>
                            </li>
                        </ul>
                    </div>
                </div>
    
            </li>
    
            <li js-menu-item js-menu-event="mouseenter"> => pour utiliser un autre événement que le click
                <a href="#" js-menu-link>Open on hover</a>    
                <div js-menu-submenu>
                    ...
                </div>
            </li>
    
        </ul>
    </nav>   

</header>
```

# Class CSS
- A l'ouverture du menu, la classe "menu-is-open" est ajoutée sur le body.
- La classe "menu-is-opening" est également ajoutée le temps de l'ouverture.
- Lorsque le menu se ferme la classe "menu-is-closing" s'ajoute, puis est supprimée à son tour.

=> Le temps de l'ouverture / fermeture peut-être modifé via l'option : openingTime

=> Le fonctionnement est le même pour les sous-menus : "submenu-is-open", "submenu-is-opening", "submenu-is-leaving" 

En plus, est ajouté sur le sous-menu courant : "is-open", "is-opening", "is-leaving" 

# Exemple CSS pour sticky
```
    header{
        &.sticky-up,
        &.sticky {
            position: fixed;
            z-index: 110000;
            top: 0;
            left: 0;
            width: 100%;
        }
        &.sticky{
            animation: slideDown 0.3s ease-in-out;
            @keyframes slideDown {
                0% {
                    transform: translateY(-100%);
                }
                100% {
                    transform: translateY(0);
                }
            }
        }
        &.sticky-up{
            transform: translateY(-100%);
            &.scroll{
                @include transition-default();
            }
            &.scroll--up{
                transform: translateY(0);
            }
        }
    }
```

# Exemple CSS pour sous-menu
```
    .submenu{
        position: absolute;
        z-index: 10;
        top: 0;
        left: 0;
        width: 100%;
        cursor: initial;
        background-color: $white;
        transition: all 250ms ease-in-out;
        @include breakpoint-max(md) {
            transform: translateX(-100%);
        }
        @include breakpoint(md) {
            top: 100%;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
        }
        @include breakpoint-max(md) {
            overflow: auto;
        }
        &.is-open{
            @include breakpoint-max(md) {
                transform: translate(0);
            }
            @include breakpoint(md) {
                opacity: 1;
                pointer-events: all;
                visibility: visible;
            }
        }
    }
```

# Événements
```
menu.on('before_open_menu', (response) => {
    console.log(response);
});

menu.on('after_open_menu', (response) => {
    console.log(response);
});

menu.on('before_open_menu_mobile', (response) => {
    console.log(response);
});

menu.on('after_open_menu_mobile', (response) => {
    console.log(response);
});

menu.on('before_open_submenu', (response) => {
    console.log(response);
});

menu.on('after_open_submenu', (response) => {
    console.log(response);
});

menu.on('before_previous_submenu', (response) => {
    console.log(response);
});

menu.on('after_previous_submenu', (response) => {
    console.log(response);
});

// only available if sticky is init
menu.on('scroll', (response) => {
    console.log(response);
});

menu.on('sticky_in', (response) => {
    console.log(response);
});

menu.on('sticky_out', (response) => {
    console.log(response);
});

menu.on('search_open', (response) => {
    console.log(response);
});

menu.on('search_close', (response) => {
    console.log(response);
});

menu.on('search_submit', (response) => {
    console.log(response);
});

```
