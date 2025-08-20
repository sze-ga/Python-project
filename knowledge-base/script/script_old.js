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

// Rekurzív függvény a Markdownból generált HTML listából való TOC építéshez
function buildTOCList(htmlList) {
    const ul = document.createElement('ul');
    Array.from(htmlList.children).forEach(li => {
        const newLi = document.createElement('li');
        const link = li.querySelector(':scope > a');
        if (link) {
            const a = document.createElement('a');
            a.href = "#";
            a.textContent = link.textContent;
            a.dataset.filePath = link.getAttribute('href');
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadMarkdownContent(a.dataset.filePath, a);
            });
            newLi.appendChild(a);
        } else {
            // Ha nincs link, csak szöveg (pl. kategória)
            newLi.textContent = li.textContent;
        }
        // Ha van benne további <ul>, rekurzívan feldolgozzuk
        const subUl = li.querySelector(':scope > ul');
        if (subUl) {
            newLi.appendChild(buildTOCList(subUl));
        }
        ul.appendChild(newLi);
    });
    return ul;
}

// TOC betöltése a toc.md-ből, több szint támogatásával
async function buildTOCFromMarkdown() {
    const tocNav = document.getElementById('toc-nav');
    tocNav.innerHTML = '';

    try {
        const response = await fetch('./content/toc.md');
        if (!response.ok) throw new Error('Nem sikerült betölteni a toc.md-t');
        const tocMarkdown = await response.text();

        // Markdownból HTML-t csinálunk
        const html = marked.parse(tocMarkdown);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Az első <ul> lesz a TOC gyökere
        const rootUl = tempDiv.querySelector('ul');
        if (rootUl) {
            const tocList = buildTOCList(rootUl);
            tocNav.appendChild(tocList);
        } else {
            tocNav.innerHTML = '<p>Nincs tartalom a tartalomjegyzékben.</p>';
        }
    } catch (error) {
        tocNav.innerHTML = '<p>Nem sikerült betölteni a tartalomjegyzéket.</p>';
        console.error(error);
    }
}

// Keresési logika (többszintű TOC-hoz)
function handleSearch(searchTerm) {
    const tocNav = document.getElementById('toc-nav');
    const tocLinks = tocNav.querySelectorAll('a');

    tocLinks.forEach(link => {
        const li = link.closest('li');
        if (link.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
            li.style.display = '';
            // Szülő <li>-k is látszódjanak
            let parent = li.parentElement;
            while (parent && parent !== tocNav) {
                if (parent.tagName.toLowerCase() === 'ul') {
                    parent.style.display = '';
                }
                parent = parent.parentElement;
            }
        } else {
            li.style.display = 'none';
        }
    });

    if (searchTerm === '') {
        tocNav.querySelectorAll('li, ul').forEach(el => el.style.display = '');
    }
}

// Fő indító függvény
document.addEventListener('DOMContentLoaded', async () => {
    await buildTOCFromMarkdown();

    document.getElementById('search-input').addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // Alapértelmezett tartalom betöltése (az első link a TOC-ból)
    try {
        const response = await fetch('./content/toc.md');
        if (response.ok) {
            const tocMarkdown = await response.text();
            const html = marked.parse(tocMarkdown);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const firstLink = tempDiv.querySelector('a');
            if (firstLink) {
                loadMarkdownContent(firstLink.getAttribute('href'));
            }
        }
    } catch (error) {
        console.error('Nem sikerült betölteni az alapértelmezett tartalmat:', error);
    }
});