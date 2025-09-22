class AreaComunModel {
  final int? id_area;
  final String? nombre_area;
  final int? capacidad;
  final bool? requiere_pago;
  final double? precio_por_bloque;
  final String? apertura_hora;
  final String? cierre_hora;
  final String? dias_habiles;
  final String? reglas;
  final String? estado;

  AreaComunModel({
    this.id_area,
    this.nombre_area,
    this.capacidad,
    this.requiere_pago,
    this.precio_por_bloque,
    this.apertura_hora,
    this.cierre_hora,
    this.dias_habiles,
    this.reglas,
    this.estado,
  });

  factory AreaComunModel.fromJson(Map<String, dynamic> json) {
    return AreaComunModel(
      id_area: json['id_area'],
      nombre_area: json['nombre_area'],
      capacidad: json['capacidad'],
      requiere_pago: json['requiere_pago'],
      precio_por_bloque: json['precio_por_bloque'] is num
          ? (json['precio_por_bloque'] as num).toDouble()
          : double.tryParse(json['precio_por_bloque'].toString()) ?? 0.0,
      apertura_hora: json['apertura_hora'],
      cierre_hora: json['cierre_hora'],
      dias_habiles: json['dias_habiles'],
      reglas: json['reglas'] ?? '',
      estado: json['estado'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id_area': id_area,
    'nombre_area': nombre_area,
    'capacidad': capacidad,
    'requiere_pago': requiere_pago,
    'precio_por_bloque': precio_por_bloque,
    'apertura_hora': apertura_hora,
    'cierre_hora': cierre_hora,
    'dias_habiles': dias_habiles,
    'reglas': reglas,
    'estado': estado,
  };
}
