class ReservaModel {
  final int? id_reserva;
  final String? fecha;
  final String? nombre_area;
  final String? hora_inicio;
  final String? hora_fin;
  final String? nota;
  final String? estado;
  final String? url_comprobante;
  final String? motivo_cancelacion;
  ReservaModel({
    this.id_reserva,
    this.fecha,
    this.hora_inicio,
    this.hora_fin,
    this.nota,
    this.estado,
    this.motivo_cancelacion,
    this.url_comprobante,
    this.nombre_area,
  });

  factory ReservaModel.fromJson(Map<String, dynamic> json) {
    return ReservaModel(
      id_reserva: json['id_reserva'],
      fecha: json['fecha'],
      hora_inicio: json['hora_inicio'],
      hora_fin: json['hora_fin'],
      nota: json['nota'],
      estado: json['estado'],
      motivo_cancelacion: json['motivo_cancelacion'],
      url_comprobante: json['url_comprobante'],
      nombre_area: json['nombre_area'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id_reserva': id_reserva,
    'fecha': fecha,
    'hora_inicio': hora_inicio,
    'hora_fin': hora_fin,
    'nota': nota,
    'estado': estado,
    'motivo_cancelacion': motivo_cancelacion,
    'url_comprobante': url_comprobante,
    'nombre_area': nombre_area,
  };
}
