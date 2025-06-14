# Proyecto de Detección con IA y Web Frontend

Este proyecto utiliza **YOLOv8** para análisis de imágenes en el backend (Python), y una interfaz web desarrollada con **Next.js** en el frontend.

## 📁 Estructura del Proyecto

├── backend/ # Backend en Python con YOLOv8
│ ├── yolov8_env/ # (Ignorado) Entorno virtual Python
│ ├── requirements.txt
│ ├── detector.py
│ ├── yolov8m.pt #Si tu GPU es buena
│ └── yolov8n.pt #Si no tienes una buena GPU
├── zero/ # Frontend en Next.js
│ ├── .next
│ ├── node_modules/ # (Ignorado) Dependencias de Node
│ ├── pages
| | └── api
| | | └── socket.js
│ ├── public
│ ├── src
│ | ├── app
│ | | ├── dashboard
│ | | | ├── background
│ | | | ├── dvr
│ | | | | └── manage
│ | | | ├── images
│ | | | ├── notifications
│ | | | └── users
│ | ├── components
│ | | └── ui
│ | ├── hooks
│ | └── lib

---

## 🚀 Requisitos Previos

- **Python 3.8+**
- **Node.js** v18 o superior
- **pip** y **npm/yarn**
- Acceso a una cámara o fuente RTSP (para pruebas de detección)
- (Opcional) `virtualenv` o `venv` para crear entornos virtuales

---

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

2. Backend (Python + YOLOv8)

cd backend

#Trabajando en Kali Linux no dejo instalarlas de manera 
#nativa tuve que levantar un entorno virtual

python -m venv yolov8_env
source yolov8_env/bin/activate  # En Windows: yolov8_env\Scripts\activate

#Puedes instalar estas paqueterias
pip install "python-socketio[client]"
pip install --upgrade pip                                
pip install ultralytics opencv-python socketio

#Si no aqui deje los requerimientos que tenia en mi PC
pip install -r requirements.txt

3. Frontend (Next.js)

cd ../zero
npm install  # o yarn
Instala todas las dependencias que aparece en el archivo dependencies.txt
npm run dev

La aplicación estará disponible en http://localhost:3000.

📦 Scripts Útiles

Backend

python detector.py

Frontend

npm run dev      # Desarrollo
npm run build    # Producción
npm run start    # Ejecutar build


🧠 Modelo YOLOv8

El backend está basado en Ultralytics YOLOv8. Puedes cambiar el modelo por otro (yolov8s.pt, yolov8m.pt, etc.) según tus necesidades y recursos.
📝 Notas

    La carpeta yolov8_env y node_modules están ignoradas en el control de versiones.

    Si tienes errores de WebSocket o conexión RTSP, revisa tu red y configuración del DVR o cámara.

📬 Contacto

Para dudas o contribuciones, abre un issue o contacta a mapd020304@gs.utm.mx.