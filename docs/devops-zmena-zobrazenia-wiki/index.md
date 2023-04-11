# Ako zmeniť zobrazenie výstupného HTML pre Azure DevOps Wiki

Azure DevOps momentálne neobsahuje funkcionalitu, ktorá by umožnila pridať vlastné css pravidlá a tak pozmeniť spôsob zobrazenia výstupného HTML pre Azure DevOps Wiki. Je to však možné docieliť úpravou niektorého zo statických **css** súborov, ktoré DevOps linkuje do výstupného HTML.

Napríklad súbor `ms.vss-wiki-web.wiki-renderer-content.min.css`, ktorý sa nachádza v priečinku `C:\Program Files\Azure DevOps Server 2022\Application Tier\Web Services\_static\tfs\Dev19.M205.3\_ext\ms.vss-wiki-web\wiki-renderer-content` na DevOps serveri.

Ak chceme napríklad, aby všetky obrázky boli vycentrované na stred obrazovky, pridáme na koniec súboru nasledovný obsah:

```css
.wiki-md-container p > img {
    margin:0 auto;
    display:block;
}
```