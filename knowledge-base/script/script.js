function buildTree(toc) {
    const root = {};
    toc.forEach(item => {
        let node = root;
        item.parts.forEach((part, idx) => {
            if (!node[part]) node[part] = { __children: {}, __item: null };
            if (idx === item.parts.length - 1) {
                node[part].__item = item;
            }
            node = node[part].__children;
        });
    });
    return root;
}

// ABC sorrend, először mappák, aztán fájlok
function createTOCList(node, parentKey = "") {
    const ul = document.createElement('ul');
    // Először mappák (amelyeknek van __children, de nincs __item vagy __item.path nem végződik .md-re)
    const folders = [];
    const files = [];
    for (const key in node) {
        if (key === "__children" || key === "__item") continue;
        const entry = node[key];
        if (Object.keys(entry.__children).length > 0) {
            folders.push({ key, entry });
        } else if (entry.__item) {
            files.push({ key, entry });
        }
    }
    folders.sort((a, b) => a.key.localeCompare(b.key, 'hu'));
    files.sort((a, b) => {
        // welcome.md mindig első legyen
        if (a.entry.__item.path.toLowerCase() === "welcome.md") return -1;
        if (b.entry.__item.path.toLowerCase() === "welcome.md") return 1;
        return a.key.localeCompare(b.key, 'hu');
    });

    // Mappák
    for (const { key, entry } of folders) {
        const li = document.createElement('li');
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = entry.__item && entry.__item.title ? entry.__item.title : key;
        details.appendChild(summary);
        details.appendChild(createTOCList(entry.__children, key));
        li.appendChild(details);
        ul.appendChild(li);
    }
    // Fájlok
    for (const { key, entry } of files) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = "#";
        a.textContent = entry.__item.title || key;
        a.dataset.filePath = entry.__item.path;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            loadMarkdownContent(a.dataset.filePath, a);
        });
        li.appendChild(a);
        ul.appendChild(li);
    }
    return ul;
}

// Kódblokkokhoz copy gomb hozzáadása
function addCopyButtons() {
    document.querySelectorAll('#content-display pre code').forEach((block) => {
        if (block.parentElement.querySelector('.copy-btn')) return;
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.type = 'button';
        button.innerText = 'Kopier';
        button.style.position = 'absolute';
        button.style.top = '8px';
        button.style.right = '8px';
        button.style.padding = '2px 10px';
        button.style.fontSize = '0.9em';
        button.style.cursor = 'pointer';
        button.style.borderRadius = '5px';
        button.style.border = 'none';
        button.style.background = '#e9ecef';
        button.style.color = '#333';
        button.style.zIndex = '2';

        const pre = block.parentElement;
        pre.style.position = 'relative';
        pre.appendChild(button);

        button.addEventListener('click', () => {
            navigator.clipboard.writeText(block.innerText);
            button.innerText = 'Kopieret!';
            setTimeout(() => button.innerText = 'Kopier', 1200);
        });
    });
}

async function loadMarkdownContent(filePath, linkElement) {
    try {
        const response = await fetch(`./content/${filePath}`);
        if (!response.ok) throw new Error(`Nem sikerült betölteni: ${filePath}`);
        const markdown = await response.text();
        document.getElementById('content-display').innerHTML = marked.parse(markdown);

        document.querySelectorAll('#toc-nav a').forEach(link => link.classList.remove('active'));
        if (linkElement) linkElement.classList.add('active');
        hljs.highlightAll();
        addCopyButtons();
    } catch (error) {
        document.getElementById('content-display').innerHTML = `<h2>Hiba</h2><p>${error.message}</p>`;
    }
}

async function buildTOCFromJSON() {
    const tocNav = document.getElementById('toc-nav');
    tocNav.innerHTML = '';
    try {
        const response = await fetch('./toc.json');
        if (!response.ok) throw new Error('Nem sikerült betölteni a toc.json-t');
        const toc = await response.json();
        const tree = buildTree(toc);
        const tocList = createTOCList(tree);
        tocNav.appendChild(tocList);
    } catch (error) {
        tocNav.innerHTML = '<p>Nem sikerült betölteni a tartalomjegyzéket.</p>';
        console.error(error);
    }
}

function handleSearch(searchTerm) {
    const tocNav = document.getElementById('toc-nav');
    const links = tocNav.querySelectorAll('a');
    links.forEach(link => {
        if (link.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
            link.parentElement.style.display = '';
            let parent = link.parentElement.parentElement;
            while (parent && parent.tagName === 'DETAILS') {
                parent.open = true;
                parent = parent.parentElement.parentElement;
            }
        } else {
            link.parentElement.style.display = 'none';
        }
    });
    if (searchTerm === '') {
        links.forEach(link => link.parentElement.style.display = '');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await buildTOCFromJSON();

    document.getElementById('search-input').addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // Mindig a welcome.md-t töltsük be elsőként
    try {
        const response = await fetch('./content/welcome.md');
        if (response.ok) {
            const markdown = await response.text();
            document.getElementById('content-display').innerHTML = marked.parse(markdown);
            hljs.highlightAll();
            addCopyButtons();
        }
    } catch (error) {
        console.error('Nem sikerült betölteni a welcome.md-t:', error);
    }
});