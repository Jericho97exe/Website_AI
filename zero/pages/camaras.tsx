import LiveStream from '@/components/LiveStream';

export default function CamaraPage() {
  return (
    <div>
      <h1>Vigilancia en Vivo</h1>
      <LiveStream cameraId="camara1" />
    </div>
  );
}