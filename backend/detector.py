import cv2
import socketio
from ultralytics import YOLO
import time
from datetime import datetime
import base64

# Cargar el modelo YOLOv8
model = YOLO("yolov8n.pt")  # Usa yolov8s.pt o yolov8m.pt si tienes GPU

# Conexión WebSocket al frontend Next.js
sio = socketio.Client()

try:
    sio.connect(
        'http://localhost:3000',
        transports=['websocket'],
        socketio_path='/api/socket'
    )
    print("Conectado a Socket.IO")
except Exception as e:
    print("Error conectando a Socket.IO:", e)
    exit(1)

# Usa la cámara local
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("No se pudo abrir la webcam")
    exit(1)

last_sent_detection = 0
interval_detection = 1.0  # segundos entre envíos de detección
last_sent_frame = 0
interval_frame = 0.2  # segundos entre envíos de frames (5 fps)

cv2.namedWindow("Webcam - Detección YOLOv8", cv2.WINDOW_NORMAL)

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            print("No se pudo capturar imagen de la webcam")
            continue

        results = model.predict(frame, conf=0.5, verbose=False)

        # Dibujar detecciones
        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                cls_name = model.names[cls_id]
                conf = float(box.conf[0])

                if cls_name == 'person':
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    label = f'{cls_name} {conf:.2f}'
                    cv2.putText(frame, label, (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

                    now = time.time()
                    if now - last_sent_detection > interval_detection:
                        sio.emit('deteccion', {
                            'tipo': cls_name,
                            'confianza': round(conf, 2),
                            'timestamp': datetime.now().isoformat()
                        })
                        print(f"Persona detectada ({conf:.2f}) enviada al servidor")
                        last_sent_detection = now

        # Enviar frame codificado en base64 cada 0.2 segundos
        now = time.time()
        if now - last_sent_frame > interval_frame:
            _, buffer = cv2.imencode('.jpg', frame)
            jpg_as_text = base64.b64encode(buffer).decode('utf-8')
            sio.emit('video_frame', {'image': jpg_as_text})
            last_sent_frame = now

        cv2.imshow("Webcam - Detección YOLOv8", frame)

        key = cv2.waitKey(1)
        if key == ord('q') or key == 27:  # 'q' o ESC para salir
            break

except KeyboardInterrupt:
    print("Detención manual por teclado")

finally:
    cap.release()
    cv2.destroyWindow("Webcam - Detección YOLOv8")
    sio.disconnect()
    print("Recursos liberados y desconectado de Socket.IO")