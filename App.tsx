import CreateBeat from '@/CreateBeat';

export default function App() {
  const baseFrequency: number = 440;
  const desiredFrequency: number = 30;
  return (
    <CreateBeat baseFrequency={baseFrequency} desiredFrequency={desiredFrequency}/>
  );
}
