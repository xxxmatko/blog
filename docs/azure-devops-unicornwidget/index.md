# Unicorn widget, alebo ako začať s vývojom rozšírení pre Azure DevOps

Dashboard widgety sa implementujú, ako [contributions](https://learn.microsoft.com/en-us/azure/devops/extend/develop/contributions-overview?view=azure-devops), v rámci extension frameworku. Jedno rozšírenie môže obsahovať aj viac takýchto contributions. 

V tomto článku ti ukážem, ako vytvoriť rozšírenie pre Azure DevOps, konkrétne widget pre dashboard.

> Zdrojový kód je možné stiahnuť [z nášho repozitára](https://github.com/slovanet/azure-devops-unicornwidget).


## Štruktúra projektu

Štruktúra projektu je nasledovná:

```cmd
├─ .vscode
│  ├─ settings.json
│  └─ tasks.json
├─ grunt                   // Grunt build tasky 
├─ html
│  └─ unicornwidget.html   // HTML stránka pre widget
├─ img
├─ js
│  └─ unicornwidget.js
├─ less
│  └─ unicornwidget.less
├─ extension.json          // Manifest pre extension
├─ gruntfile.js
└─ package.json
```


### package.json

Projekt je potrebné otvoriť v prostredí [Visual Studio Code](https://code.visualstudio.com/download). Po stlačení klávesovej skratky `Ctrl + Shift + B` sa zobrazí zoznam zadefinovaných taskov, z ktorého zvolíš **restore**. Task spustí príkaz `npm install` a stiahne všetky dependencies zadefinované v súbore **package.json**. Súbor, okrem spomenutých dependencies, obsahuje aj ďalšie atribúty widgetu, ktoré sa pri builde prenesú aj do manifestu:

* `version`: verzia rozšírenia (pri builde nahradí placehoder `#{Project.AssemblyInfo.Version}#`),
* `name`: názov rozšírenia (pri builde nahradí placehoder `#{Extension.Id}#`),
* `author`: meno autora rozšírenia (pri builde nahradí placehoder `#{Extension.Publisher}#`).


### extension.json 

Rozšírenie musí obsahovať [manifest](https://learn.microsoft.com/en-us/azure/devops/extend/develop/manifest?view=azure-devops), ktorý definuje základné informácie o rozšírení (id, názov, autor, ...) a spôsob, akým vlastne [rozširuje funkcionalitu](https://learn.microsoft.com/en-us/azure/devops/extend/reference/targets/overview?view=azure-devops) Azure DevOps.

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

Každá položka v zozname `contributions` definuje nasledovné [vlastnosti](https://learn.microsoft.com/en-us/azure/devops/extend/develop/manifest?view=azure-devops#contributions):

* `id`: Jednoznačný identifikátor pre contribution, ktorý musí byť unikátny v rámci rozšírenia. Predvolene sa použije hodnota atribútu `name` zo súboru **package.json**.
* `type`: Pre contribution typu widget predstavuje hodnotu `ms.vss-dashboards-web`.
* `targets`: Časť Azure DevOps, ktorú daná contribution rozširuje. Pre widgety, ktoré rozširujú dashboard, predstavuje hodnotu `ms.vss-dashboards-web.widget-catalog`.
* `properties`: Obsahuje objekt, ktorý definuje ďalšie vlastnosti pre zvolený typ contribution.

Položka `files` definuje zoznam súborov, ktoré majú byť súčasťou balíčka a dostupné prostredníctvom URL adresy.


## HTML stránka - unicornwidget.html

HTML stránka definuje UI layout. Obsahuje referencie na css a javascript súbory. Referencia na tento súbor je definovaná v manifeste, v atribúte `contributions.properties.uri`.

HTML stránka sa pri zobrazení načítava prostredníctvom [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe), z čoho plynú aj určité obmedzenia.

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <!-- Referencia na unicornwidget.css -->
        <link href="../css/#{Extension.Id}#.css?v=#{Project.AssemblyInfo.Version}#" rel="stylesheet" type="text/css" />
    </head>
    <body>
        <div class="widget unicorn"></div>
        <!-- Referencia na SDK -->
        <script src="../js/libs/vss.js"></script>
        <!-- Referencia na unicornwidget.js -->
        <script src="../js/#{Extension.Id}#.js?v=#{Project.AssemblyInfo.Version}#"></script>
    </body>
</html>
```

## Javascript - unicornwidget.js

Javascript zabezpečuje inicializáciu widgetu, a obsahuje aj samotnú biznis logiku, zároveň notifikuje extension framework o výsledku inicializácie. (pozn. Nemusí byť nutne umiestnený v samostatnom súbore.) 

```js
(function (root, factory) {
    factory(root.VSS);
}(typeof self !== "undefined" ? self : this, function (vss) {
    //#region [ Initialization ]

    vss.init({                        
        explicitNotifyLoaded: true,
        usePlatformStyles: true
    });
    
    vss.require([
        "TFS/Dashboards/WidgetHelpers"
    ], function (WidgetHelpers) {
        var webContext = vss.getWebContext();

        // Vytvorenie modelu
        var model = new Model({
            projectId: webContext.project.id,
            collectionUri: webContext.collection.uri,
            widgetHelpers: WidgetHelpers
        });

        // Registrácia widgetu
        vss.register("unicornwidget", function () {
            return model;
        });

        vss.notifyLoadSucceeded();
    });

    //#endregion
}));
```


## Vytvorenie inštalačného balíčka

Po stlačení klávesovej skratky `Ctrl + Shift + B` zvol možnosť **build**, čím sa spustí buildovací proces, ktorého výstupom bude inštalačný balíček, t.j. súbor s príponou `.vsix`. Následne je možné daný súbor nahrať do DevOps, prípadne do [Marketplace](https://marketplace.visualstudio.com/manage/createpublisher).


## Odkazy

[Add a dashboard widget](https://learn.microsoft.com/en-us/azure/devops/extend/develop/add-dashboard-widget?view=azure-devops)    
[Extension manifest reference](https://learn.microsoft.com/en-us/azure/devops/extend/develop/manifest?view=azure-devops)    
[Extensibility points](https://learn.microsoft.com/en-us/azure/devops/extend/reference/targets/overview?view=azure-devops)    
[Zdrojový kód widgetu](https://github.com/slovanet/azure-devops-unicornwidget)