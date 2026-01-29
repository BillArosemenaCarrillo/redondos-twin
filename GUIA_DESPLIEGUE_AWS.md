# 🚀 Guía de Despliegue en AWS (Vanguard)

Esta guía te permitirá subir tu **Gemelo Digital (Next.js)** a internet para que Redondos pueda verlo desde cualquier tablet o celular.

Usaremos **AWS Amplify**, que es la forma más moderna y "automática" de publicar aplicaciones como esta.

---

## 🛑 Prerrequisitos
1.  **Cuenta AWS**: Debes tener acceso a la consola de AWS (`aws.amazon.com`).
2.  **Código en GitHub**: El código de tu proyecto debe estar subido a un repositorio de GitHub (Privado o Público).
    *   *Si no está en GitHub, avísame para ayudarte a subirlo primero.*

---

## 🏃‍♂️ Pasos para Desplegar (Método Fácil)

### 1. Entra a AWS Amplify
1.  En el buscador de servicios de AWS (arriba a la izquierda), escribe **"Amplify"**.
2.  Haz clic en **"AWS Amplify"**.
3.  Busca el botón naranja **"Create New App"** (o "Get Started") y selecciona **"Host Web App"**.

### 2. Conecta tu Código
1.  Te preguntará **"Where is your code?"**. Selecciona **GitHub**.
2.  AWS te pedirá permiso para ver tus repositorios. Dale "Autorizar".
3.  En la lista, selecciona el repositorio: `redondos-twin` (o el nombre que le hayas puesto).
4.  Branch: Deja marcado **`main`**.
5.  Clic en **Next**.

### 3. Configuración de Construcción (Build)
AWS detectará automáticamente que es una App **Next.js**.

1.  Verás una sección llamada **"Build settings"**.
2.  **¡IMPORTANTE!** Asegúrate de que detecte el framework como `Web - Next.js`.
3.  No necesitas cambiar nada más por ahora.
4.  Clic en **Next**.

### 4. Revisar y Desplegar
1.  Verás un resumen.
2.  Clic en **"Save and Deploy"**.

---

## ⏳ ¿Qué pasa ahora?
Verás 4 círculos de progreso:
1.  **Provision:** AWS está alquilando un servidor para ti.
2.  **Build:** AWS está instalando las librerías (`npm install`) y construyendo la app.
3.  **Deploy:** Está copiando los archivos a la red mundial.
4.  **Verify:** Verifica que todo funcione.

**Tiempo estimado:** 3 a 5 minutos.

---

## 🌐 Tu Enlace Final
Al terminar, AWS te dará un enlace verde similar a:
👉 `https://main.d2x4yzasd.amplifyapp.com`

¡Ese es el enlace que puedes enviar por WhatsApp a Redondos! 🎉

---

### 🔧 Solución de Problemas Comunes

*   **Error en "Build":** A veces falla si la versión de Node.js es vieja.
    *   *Solución:* En Amplify > App Settings > Build Settings > Edit.
    *   Añade una variable de entorno: `AMPLIFY_NodeJS_Version` = `20` (o la versión que usamos localmente).

*   **Pantalla en Blanco:** Si la app carga pero no ves el mapa 3D.
    *   *Solución:* Faltan las variables de entorno (`NEXT_PUBLIC_MAPBOX_TOKEN`, etc).
    *   Ve a **App settings > Environment variables** y agrégalas.
