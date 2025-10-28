import Table from '../models/Table.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateQRCodeSlug, generateQRCodeData } from '../utils/qrCodeUtils.js';
import { generateTableSessionId } from '../utils/qrCodeUtils.js';
import config from '../config/config.js';

/**
 * Create a new table (Admin)
 * POST /api/tables
 */
export const createTable = asyncHandler(async (req, res) => {
	const { number } = req.body;

	// Ensure table number unique
	const existing = await Table.findOne({ number });
	if (existing) {
		return res.status(400).json({ success: false, message: 'Table number already exists' });
	}

	const qrSlug = generateQRCodeSlug(number);

	const table = new Table({ number, qrSlug });
	await table.save();

	res.status(201).json({
		success: true,
		message: 'Table created successfully',
		data: generateQRCodeData(table, config.FRONTEND_URL)
	});
});

/**
 * List all tables (Admin)
 * GET /api/tables
 */
export const listTables = asyncHandler(async (req, res) => {
	const tables = await Table.find().sort({ number: 1 });
	const data = tables.map(t => generateQRCodeData(t, config.FRONTEND_URL));
	res.status(200).json({ success: true, message: 'Tables retrieved', data });
});

/**
 * Get table by ID (Admin)
 * GET /api/tables/:id
 */
export const getTableById = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const table = await Table.findById(id);
	if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
	res.status(200).json({ success: true, data: generateQRCodeData(table, config.FRONTEND_URL) });
});

/**
 * Get table by QR slug (public)
 * GET /api/tables/qr/:qrSlug
 */
export const getTableByQrSlug = asyncHandler(async (req, res) => {
	const { qrSlug } = req.params;
	const table = await Table.findOne({ qrSlug });
	if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

	// Optionally create an active session id for this scan
	const sessionId = generateTableSessionId(qrSlug, req.get('User-Agent') || '', req.ip || '');
	table.activeSessionId = sessionId;
	await table.save();

	res.status(200).json({
		success: true,
		message: 'Table retrieved by QR slug',
		data: generateQRCodeData(table, config.FRONTEND_URL),
		sessionId
	});
});

/**
 * Update table (Admin)
 * PUT /api/tables/:id
 */
export const updateTable = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { number, active } = req.body;

	const table = await Table.findById(id);
	if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

	if (number && number !== table.number) {
		const exists = await Table.findOne({ number, _id: { $ne: id } });
		if (exists) return res.status(400).json({ success: false, message: 'Table number already in use' });
		table.number = number;
		table.qrSlug = generateQRCodeSlug(number);
	}

	if (active !== undefined) table.active = !!active;

	await table.save();

	res.status(200).json({ success: true, message: 'Table updated', data: generateQRCodeData(table, config.FRONTEND_URL) });
});

/**
 * Delete table (Admin)
 * DELETE /api/tables/:id
 */
export const deleteTable = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const table = await Table.findById(id);
	if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

	await Table.findByIdAndDelete(id);

	res.status(200).json({ success: true, message: 'Table deleted' });
});

/**
 * Update table occupancy (Staff/Admin)
 * PATCH /api/tables/:id/occupancy
 */
export const updateOccupancy = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { occupied } = req.body;

	if (typeof occupied !== 'boolean') {
		return res.status(400).json({ success: false, message: 'occupied field must be a boolean' });
	}

	const table = await Table.findById(id);
	if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

	table.occupied = occupied;
	await table.save();

	res.status(200).json({ success: true, message: 'Table occupancy updated', data: generateQRCodeData(table, config.FRONTEND_URL) });
});

export default {
	createTable,
	listTables,
	getTableById,
	getTableByQrSlug,
	updateTable,
	deleteTable
};