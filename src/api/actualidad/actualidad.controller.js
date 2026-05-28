const actualidadService = require('./actualidad.service');
const { sendServerError } = require('../../utils/api-errors');

async function list(_req, res) {
  try {
    const rows = await actualidadService.listNews();
    res.json(rows);
  } catch (error) {
    sendServerError(res, error, 'actualidad.list');
  }
}

async function remove(req, res) {
  const { noticiaId } = req.params;
  try {
    const out = await actualidadService.deleteNews(noticiaId);
    if (!out.affectedRows) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json(out);
  } catch (error) {
    sendServerError(res, error, 'actualidad.remove');
  }
}

async function getById(req, res) {
  const { idContent } = req.params;
  try {
    const row = await actualidadService.getNewsMapped(idContent);
    if (!row) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json(row);
  } catch (error) {
    sendServerError(res, error, 'actualidad.getById');
  }
}

async function create(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Adjunta una imagen (máx. 10 MB, solo formatos de imagen).',
      });
    }
    const titulo = String(req.body.titulo ?? '').trim();
    if (!titulo) {
      return res.status(400).json({ error: 'El título es obligatorio.' });
    }
    const contenidoRaw = String(req.body.contenido ?? '');
    if (!actualidadService.plainTextFromHtml(contenidoRaw)) {
      return res
        .status(400)
        .json({ error: 'El detalle o contenido es obligatorio.' });
    }
    const out = await actualidadService.createNewsWithImage(req.file, req.body);
    res.json(out);
  } catch (error) {
    const status = error.status || error.statusCode;
    if (status === 400 && error.expose) {
      return res.status(400).json({ error: error.message });
    }
    sendServerError(res, error, 'actualidad.create');
  }
}

async function patch(req, res) {
  const { id } = req.params;
  try {
    const titulo = String(req.body.titulo ?? '').trim();
    if (!titulo) {
      return res.status(400).json({ error: 'El título es obligatorio.' });
    }
    const contenidoRaw = String(req.body.contenido ?? '');
    if (!actualidadService.plainTextFromHtml(contenidoRaw)) {
      return res
        .status(400)
        .json({ error: 'El detalle o contenido es obligatorio.' });
    }

    const out = req.file
      ? await actualidadService.patchNewsWithImage(id, req.file, req.body)
      : await actualidadService.patchNews(id, req.body);

    if (!out.affectedRows) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json(out);
  } catch (error) {
    const status = error.status || error.statusCode;
    if (status === 400 && error.expose) {
      return res.status(400).json({ error: error.message });
    }
    sendServerError(res, error, 'actualidad.patch');
  }
}

module.exports = {
  list,
  remove,
  getById,
  create,
  patch,
};
