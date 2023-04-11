# Unicorn widget alebo ako začať s vývojom rozšírení pre Azure DevOps

Dashboard widget-y sa implementujú ako *[contributions](https://learn.microsoft.com/en-us/azure/devops/extend/develop/contributions-overview?view=azure-devops)* v rámci extension framework-u. Jedno rozšírenie môže obsahovať aj viac takýchto contributions. 

V tomto článku si ukážeme, ako vytvoriť rozšírenie pre Azure DevOps, konkrétne widget pre dashboard.

> Zdrojový kód je možné stiahnuť [z nášho repozitára](https://github.com/slovanet/azure-devops-unicornwidget).


## Štruktúra projektu

Štruktúra projektu je nasledovná:

```
├─── .vscode
│   ├─── settings.json
│   └─── tasks.json
├─── grunt                      // Grunt build tasky 
├─── html
│   └─── unicornwidget.html     // HTML stránka pre widget
├─── img
├─── js
│   └─── unicornwidget.js
├─── less
│   └─── unicornwidget.less
├─── extension.json             // Manifest pre extension
├─── gruntfile.js
└─── package.json
```


### package.json

Projekt je potrebné otvoriť v prostredí [Visual Studio Code](https://code.visualstudio.com/download). Po stlačení klávesovej skratky `Ctrl + Shift + B` sa zobrazí zoznam zadefinovaných task-ov, z ktorého zvolíme **restore**. Task spustí príkaz `npm install` a stiahne všetky dependencies zadefinované v súbore **package.json**. Súbor, okrem spomenutých dependencies, obsahuje aj ďalšie atribúty widgetu/rozšírenia, ktoré sa pri builde prenesú aj do manifestu:

* **version**: verzia rozšírenia (pri builde nahradí placehoder `#{Project.AssemblyInfo.Version}#`),
* **name**: názov rozšírenia (pri builde nahradí placehoder `#{Extension.Id}#`),
* **author**: meno autora rozšírenia (pri builde nahradí placehoder `#{Extension.Publisher}#`).


### extension.json 

Rozšírenie musí obsahovať [manifest](https://learn.microsoft.com/en-us/azure/devops/extend/develop/manifest?view=azure-devops), ktorý definuje základné informácie o rozšírení (id, názov, autor, ...) a spôsob [akým vlastne rozširuje funkcionalitu](https://learn.microsoft.com/en-us/azure/devops/extend/reference/targets/overview?view=azure-devops)  Azure DevOps.

```json
{
    "manifestVersion": 1,
    "id": "#{Extension.Id}#",
    "version": "#{Project.AssemblyInfo.Version}#",
    "name": "Unicorn Widget",
    "description": "Marvelous unicorn widget",
    "publisher": "#{Extension.Publisher}#",
    "categories": ["Azure Boards"],
    "targets": [{
        "id": "Microsoft.VisualStudio.Services"
    }],
    "icons": {
        "default": "img/logo.png"
    },
    "contributions": [{
        "id": "#{Extension.Id}#",
        "type": "ms.vss-dashboards-web.widget",
        "targets": [
            "ms.vss-dashboards-web.widget-catalog"
        ],
        "properties": {
            "name": "Unicorn Widget",
            "description": "Marvelous unicorn widget",
            "previewImageUrl": "img/preview.png",                            
            "uri": "html/#{Extension.Id}#.html?v=#{Project.AssemblyInfo.Version}#",
            "supportedSizes": [
                { "rowSpan": 1, "columnSpan": 1 }
            ],
            "supportedScopes": ["project_team"],
            "isNameConfigurable": true
        }
    }],
    "files": [
        { "path": "html", "addressable": true },
        { "path": "js", "addressable": true },
        { "path": "css", "addressable": true },
        { "path": "img", "addressable": true }
    ],
    "scopes":[
        "vso.work"
    ]
}
```

Každa položka v zozname `contributions` definuje nasledovné [vlastnosti](https://learn.microsoft.com/en-us/azure/devops/extend/develop/manifest?view=azure-devops#contributions):

* `id`: Jednoznačný identifikátor pre contribution, ktorý musí byť unikátny v rámci rozšírenia. Defaultne sa použije hodnota atribútu `name` zo súboru **package.json**.
* `type`: Pre contribution typu widget predstavuje hodnotu `ms.vss-dashboards-web`.
* `targets`: Časť Azure DevOps, ktorú daná contribution rozširuje. Pre widgety, ktoré rozširujú dashboard predstavuje hodnotu `ms.vss-dashboards-web.widget-catalog`.
* `properties`: Obsahuje objekt, ktorý definuje ďaľšie vlastnosti pre zvolený tyú contribution.

Položka `files` definuje zoznam súborov, ktoré majú byť súčasťou balíčka a dostupné prostredníctvom URL adresy.


## Vytvorenie inštalačného balíčka

Po stlačení klávesovej skratky `Ctrl + Shift + B` zvolíme možnosť **build**, čím sa spustí build, ktorého výstupom bude inštalačný balíček - súbor s príponou `.vsix`. Následne je možné súbor nahrať do DevOps, prípadne do [Marketplace](https://marketplace.visualstudio.com/manage/createpublisher).