# Install
```
yarn add https://bitbucket.org/adeliomgit/adeliom-menu-js.git
```

# HTML

```
<header js-menu-sticky>

    <ul js-menu>
        <li js-menu-item>
            <a href="#" js-menu-link>Exemple</a>    
        </li>
    </ul>    

</header>
```

# Import
```
import Menu from 'adeliom-menu-js';
import '~adeliom-livesearch-js/dist/livesearch.css';
```

# Available options (by default)

```
const settings = {
    'menuSelector': '[js-menu]',
    'linkSelector': '[js-menu-link]',
    'noLinkSelector': '[js-menu-nolink]',
    'parentSelector': '[js-menu-item]',
    'parentSubmenuSelector': '[js-menu-haschildren]',
    'submenuSelector': '[js-menu-sublevel]',
    'eventSelector': '[js-menu-event]', -- event type : click by default, or mouseenter
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
```

# Init Class

```
const menu = new Menu(settings);
menu.init();
```

# Listener
```
menu.on('before_menu_open', (response) => {
    console.log(response);
});

menu.on('after_menu_open', (response) => {
    console.log(response);
});

menu.on('before_menu_open_mobile', (response) => {
    console.log(response);
});

menu.on('after_menu_open_mobile', (response) => {
    console.log(response);
});

menu.on('before_submenu_open', (response) => {
    console.log(response);
});

menu.on('after_submenu_open', (response) => {
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
