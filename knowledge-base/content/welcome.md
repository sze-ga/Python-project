# Brug af Vidensbasen

Denne vidensbase er opbygget af Markdown-filer (`.md`).  
Menuen til venstre genereres automatisk ud fra filnavnene.

## Filnavngivning

- Brug `_` (underscore) til at angive "virtuelle mapper".
    - Eksempel: `HowTo_WriteAJSCode.md` → "HowTo" mappe, med "WriteAJSCode"
    - Flere `_` giver flere niveauer: `TipandTrick_tema1-2-b.md` → "TipandTrick" > "tema1-2-b"
- Maksimalt 3 niveauer understøttes.

## Titel

- Første linje i filen skal være `# Titel`, som vises i menuen.

---

## Markdown reference

### Overskrifter

```markdown
# Overskrift 1
## Overskrift 2
### Overskrift 3
```

### Fed og kursiv

```markdown
**Fed tekst**
*Kursiv tekst*
```

### Lister

```markdown
- Punkt 1
- Punkt 2
    - Underpunkt
1. Nummereret
2. Liste
```

### Links

```markdown
[Linktekst](https://eksempel.dk)
```

### Billeder

Placer billedet i `content` mappen (eller undermappe):

```markdown
![Billedtekst](content/pictures/1.jpg)
```

**Eksempel:**

![pictures/1.jpg](content/pictures/1.jpg)

### Kodeblokke

Indsæt kode mellem tre backticks og angiv evt. sprog:

```markdown
```python
print("Hej verden!")
```
```

### Inline kode

```markdown
Her er noget `inline kode`.
```

### Citater

```markdown
> Dette er et citat.
```

### Vandrette linjer

```markdown
---
```

### Tjeklister

```markdown
- [x] Gennemført
- [ ] Ikke færdig
```

---

## Kodekopiering

Alle kodeblokke har en **Kopier**-knap i øverste højre hjørne. Klik på den for at kopiere koden til udklipsholderen.

---

## Tips

- Brug menupunkterne til venstre for at navigere mellem emner.
- Tilføj nye `.md` filer i `content` mappen for at udvide vidensbasen.