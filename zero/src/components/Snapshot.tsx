interface SnapshotProps {
  channel: string | number;
}

export default function Snapshot({ channel }: SnapshotProps) {
  const src = `/api/snapshot?channel=${channel}`;

  return (
    <img 
      src={src} 
      alt={`Cámara ${channel}`}
      style={{ width: '100%' }}
      onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
    />
  );
}