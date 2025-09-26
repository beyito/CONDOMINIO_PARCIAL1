class PagoModel {
  final int id;
  final String descripcion;
  final String fechaEmision;
  final String? fechaPago;
  final double monto;
  final String? urlComprobante;
  final String estado;
  final String? tipoPago;
  final int copropietarioId;
  final String copropietarioNombre;

  PagoModel({
    required this.id,
    required this.descripcion,
    required this.fechaEmision,
    this.fechaPago,
    required this.monto,
    this.urlComprobante,
    required this.estado,
    this.tipoPago,
    required this.copropietarioId,
    required this.copropietarioNombre,
  });

  factory PagoModel.fromJson(Map<String, dynamic> json) {
    return PagoModel(
      id: json['id'],
      descripcion: json['descripcion'],
      fechaEmision: json['fecha_emision'],
      fechaPago: json['fecha_pago'],
      monto: (json['monto'] as num).toDouble(),
      urlComprobante: json['url_comprobante'],
      estado: json['estado'],
      tipoPago: json['tipo_pago'],
      copropietarioId: json['copropietario_id'],
      copropietarioNombre: json['copropietario_nombre'],
    );
  }
}
