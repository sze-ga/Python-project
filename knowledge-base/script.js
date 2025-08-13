// Függvény a Markdown tartalom betöltésére és megjelenítésére
async function loadMarkdownContent(filePath, linkElement) {
    try {
        const response = await fetch(`./content/${filePath}`);
        if (!response.ok) {
            throw new Error(`Nem sikerült betölteni a fájlt: ${response.statusText}`);
        }
        const markdown = await response.text();
        document.getElementById('content-display').innerHTML = marked.parse(markdown);

        // Minden "active" osztály eltávolítása a menüből
        document.querySelectorAll('#toc-nav a').forEach(link => {
            link.classList.remove('active');
        });

        // Az aktuális link "active" osztályának hozzáadása
        if (linkElement) {
            linkElement.classList.add('active');
        }

        // Kódblokkok szintaxisának kiemelése
        hljs.highlightAll();
    } catch (error) {
        console.error('Hiba a tartalom betöltése közben:', error);
        document.getElementById('content-display').innerHTML = `<h2>Hiba</h2><p>A tartalom nem érhető el.</p>`;
    }
}

// Rekurzív függvény a mappastruktúra beolvasására
async function getDirectoryStructure(path) {
    try {
        const response = await fetch(path);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const items = doc.querySelectorAll('a');
        const structure = [];

        for (const item of items) {
            const name = item.textContent.trim();
            const href = item.getAttribute('href');

            if (href.endsWith('/') && href !== '../' && href !== './') {
                const subPath = path + href;
                const subStructure = await getDirectoryStructure(subPath);
                structure.push({
                    name: name.replace(/\/$/, ''),
                    children: subStructure,
                });
            } else if (href.endsWith('.md')) {
                structure.push({
                    name: name.replace(/\.md$/, ''),
                    file: path.replace('./content/', '') + href,
                });
            }
        }
        return structure;
    } catch (error) {
        console.error('Hiba a mappastruktúra beolvasásakor:', error);
        return [];
    }
}

// Rekurzív függvény a TOC (Tartalomjegyzék) felépítésére a beolvasott struktúra alapján
function createTocList(items, parentUl) {
    items.forEach(item => {
        const li = document.createElement('li');

        if (item.children) {
            // Ez egy kategória
            const categoryHeader = document.createElement('span');
            categoryHeader.classList.add('category');
            categoryHeader.textContent = item.name;
            li.appendChild(categoryHeader);

            const subUl = document.createElement('ul');
            createTocList(item.children, subUl); // Rekurzív hívás
            li.appendChild(subUl);
        } else {
            // Ez egy dokumentum
            const a = document.createElement('a');
            a.href = "#";
            a.textContent = item.name;
            a.dataset.filePath = item.file;
            
            // Eseményfigyelő hozzáadása a linkre
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadMarkdownContent(a.dataset.filePath, a);
            });
            li.appendChild(a);
        }
        parentUl.appendChild(li);
    });
}

// Függvény a fő TOC felépítésére
async function buildTOC() {
    const tocNav = document.getElementById('toc-nav');
    tocNav.innerHTML = ''; // Törli a meglévő TOC-t
    const structure = await getDirectoryStructure('./content/');
    const ul = document.createElement('ul');
    createTocList(structure, ul);
    tocNav.appendChild(ul);
}

// Keresési logika
function handleSearch(searchTerm) {
    const tocNav = document.getElementById('toc-nav');
    const tocItems = tocNav.querySelectorAll('li');

    tocItems.forEach(item => {
        const link = item.querySelector('a');
        const category = item.querySelector('.category');
        
        let shouldDisplay = false;

        if (link && link.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
            shouldDisplay = true;
        } else if (category && category.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
            shouldDisplay = true;
        }

        if (shouldDisplay) {
            item.style.display = 'list-item';
            // Megjelenítjük a szülő kategóriákat is, ha van találat
            let parent = item.parentElement;
            while(parent && parent.tagName === 'UL') {
                const parentLi = parent.closest('li');
                if (parentLi) {
                    parentLi.style.display = 'list-item';
                }
                parent = parentLi ? parentLi.parentElement : null;
            }
        } else {
            item.style.display = 'none';
        }
    });

    // Ha a keresőmező üres, újraépítjük a teljes menüt
    if (searchTerm === '') {
        buildTOC();
    }
}

// Fő indító függvény
document.addEventListener('DOMContentLoaded', async () => {
    await buildTOC();
    
    // Eseményfigyelő a keresőmezőhöz
    document.getElementById('search-input').addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // Az alapértelmezett welcome.md fájl betöltése, ha létezik
    const welcomeFile = 'welcome.md';
    const welcomePath = `./content/${welcomeFile}`;
    
    try {
        const response = await fetch(welcomePath);
        if (response.ok) {
            const markdown = await response.text();
            document.getElementById('content-display').innerHTML = marked.parse(markdown);
            hljs.highlightAll();
        }
    } catch (error) {
        console.error('Hiba a welcome.md betöltése közben:', error);
    }
});
