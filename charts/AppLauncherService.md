# AppLauncherService - Flow Chart

## 1. openItems - Simple Open

```mermaid
flowchart TD
    A["openItems(apps)"] --> B["for each app"]
    B --> C{"type === folder?"}
    C -->|YES| D["openFolder(path)"]
    C -->|NO| E["openApp(path)"]
    D --> F{"more apps?"}
    E --> F
    F -->|YES| B
    F -->|NO| G["DONE"]
```

---

## 2. executeDesktopLayout - Main Flow

```mermaid
flowchart TD
    START["executeDesktopLayout(screens)"] --> WA["getWorkArea()"]
    WA -->|fail| RETURN["RETURN"]
    WA -->|ok| SPLIT["Split screens into 2 groups"]

    SPLIT --> DS["desktopScreens"]
    SPLIT --> NFS["nativeFullscreenScreens"]

    DS --> COLLECT["Collect all unique app names"]
    NFS --> COLLECT

    COLLECT --> QUIT["Quit all apps in parallel"]

    QUIT --> LOOP1{"for each desktopScreen"}

    LOOP1 --> CREATE["createAndSwitchDesktop()"]
    CREATE --> DELAY1["delay 500ms"]
    DELAY1 --> ARRANGE["arrangeScreen()"]
    ARRANGE --> LOOP1

    LOOP1 -->|done| LOOP2{"for each nativeFullscreenScreen"}

    LOOP2 --> OPEN_NF["openApp()"]
    OPEN_NF --> WAIT_NF["waitForApp() 5s"]
    WAIT_NF --> FS["fullscreenApp()"]
    FS --> DELAY2["delay 600ms"]
    DELAY2 --> LOOP2

    LOOP2 -->|done| ENDNODE["END"]
```

---

## 3. arrangeScreen - Internal Helper

```mermaid
flowchart TD
    A["arrangeScreen()"] --> B["filter valid apps"]
    B --> C["Open ALL apps in parallel"]
    C --> D["Wait for ALL apps in parallel"]
    D --> E{"layout?"}

    E -->|fullscreen| F["arrangeApp() - fill entire workArea"]
    E -->|split| G["Split workArea in half"]

    G --> H["LEFT half - app 0"]
    G --> I["RIGHT half - app 1"]
    H --> J["arrangeSplit()"]
    I --> J
```

---

## 4. Data Flow

```mermaid
flowchart LR
    P["Profile"] --> S["screens array"]

    S --> S0["screen 0 - split - 2 apps"]
    S --> S1["screen 1 - fullscreen - 1 app"]
    S --> S2["screen 2 - native fullscreen - 1 app"]

    S0 --> D1["Desktop 1: split 2 apps"]
    S1 --> D2["Desktop 2: maximize 1 app"]
    S2 --> D3["Native FS: own Space"]
```

---

## 5. IPC Calls

```mermaid
flowchart LR
    subgraph API["window.lockIt"]
        A["openApp()"]
        B["openFolder()"]
        C["waitForApp()"]
        D["arrangeApp()"]
        E["arrangeSplit()"]
        F["fullscreenApp()"]
        G["quitApp()"]
        H["createAndSwitchDesktop()"]
        I["getWorkArea()"]
        J["closeOtherApps()"]
    end
```
