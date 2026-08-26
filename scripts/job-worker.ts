import { processDueJobs } from '../src/lib/jobQueue';

async function startWorker() {
  console.log(`\n================================================================`);
  console.log(`⚡ ZAPPI BACKGROUND JOB WORKER (PERSISTENT DELAY ENGINE)`);
  console.log(`Escuchando tareas programadas en PostgreSQL cada 5 segundos...`);
  console.log(`================================================================\n`);

  while (true) {
    try {
      const stats = await processDueJobs(20);
      if (stats.processed > 0) {
        console.log(`⏱️ [${new Date().toLocaleTimeString()}] Trabajos procesados: ${stats.processed} (Éxito: ${stats.succeeded}, Fallidos: ${stats.failed})`);
      }
    } catch (err: any) {
      console.error('Error en ciclo del worker:', err.message);
    }
    // Pausa de 5 segundos entre consultas
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

startWorker().catch(console.error);