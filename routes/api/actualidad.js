const router = require('express').Router();
const multer = require('multer');
const {
  mapNewsToActualidad,
  fetchNewsList,
  fetchNewsById,
  insertNewsFromBody,
  patchNewsFromBody,
  deleteNewsById,
  uploadNewsImageBuffer,
} = require('../../models/supabaseNews.model');
const { checkToken, checkAdmin } = require('../middlewares');

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const uploadNewsImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new Error('Solo se permiten archivos de imagen.'));
      return;
    }
    cb(null, true);
  },
});

function plainTextFromHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function handleCreateUpload(req, res, next) {
  uploadNewsImage.single('imagen')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'La imagen supera los 10 MB.' });
      }
      return res.status(400).json({ error: err.message || 'No se pudo procesar la imagen.' });
    }
    next();
  });
}

//--------------- RUTAS Actualidad (Supabase public.news) -----------------//

// Ver todas las noticias
router.get('/', async (req, res) => {
  try {
    const rows = await fetchNewsList();
    res.json(rows.map(mapNewsToActualidad));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar noticia (UUID) — antes de /:idContent para no capturar "delete" como id
router.get('/delete/:noticiaId', checkToken, checkAdmin, async (req, res) => {
  const { noticiaId } = req.params;
  try {
    const out = await deleteNewsById(noticiaId);
    if (!out.affectedRows) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ver noticia por id (UUID)
router.get('/:idContent', async (req, res) => {
  const { idContent } = req.params;
  try {
    const row = await fetchNewsById(idContent);
    if (!row) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    res.json(mapNewsToActualidad(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  '/create',
  checkToken,
  checkAdmin,
  handleCreateUpload,
  async (req, res) => {
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
      if (!plainTextFromHtml(contenidoRaw)) {
        return res.status(400).json({ error: 'El detalle o contenido es obligatorio.' });
      }

      let fecha = req.body.fecha;
      if (fecha == null || String(fecha).trim() === '') {
        fecha = todayYmd();
      }

      const imageUrl = await uploadNewsImageBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      const body = {
        titulo,
        fecha,
        contenido: contenidoRaw,
        url: req.body.url,
        imagen: imageUrl,
      };
      const out = await insertNewsFromBody(body);
      res.json(out);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.put('/update/:id', checkToken, checkAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const out = await patchNewsFromBody(id, req.body);
    res.json(out);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
