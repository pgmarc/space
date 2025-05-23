import express from 'express';
import path from 'path';
import EventController from '../controllers/EventController';

const loadFileRoutes = (app: express.Application) => {
  const eventController = new EventController();
  const baseUrl = process.env.BASE_URL_PATH ?? '/api/v1';
  
  // Esta ruta puede usarse para verificar el estado del servicio de eventos
  app
    .route(`${baseUrl}/events/status`)
    .get((req, res) => {
    res.json({ status: 'El servicio de eventos WebSocket está activo' });
  });
  
  // Ruta para enviar un evento de prueba
  app
  .route(`${baseUrl}/events/test-event`)
  .post((req, res) => {
    const { serviceName, pricingVersion } = req.body;
    
    if (!serviceName || !pricingVersion) {
      return res.status(400).json({ error: 'Se requieren los campos serviceName y pricingVersion' });
    }
    
    eventController.emitPricingChange(serviceName, pricingVersion);
    res.json({ success: true, message: 'Evento enviado correctamente' });
  });
  
  // Ruta para servir el cliente WebSocket HTML
  app
  .route(`${baseUrl}/events/client`)
  .get((_req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'static', 'websocket-client.html'));
  });
};

export default loadFileRoutes;
