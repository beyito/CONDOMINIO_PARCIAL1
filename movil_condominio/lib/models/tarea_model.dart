class TareaModel {
  //         "id": 6,
  // "tarea": "Limpieza de pasillos",
  // "descripcion": "Realizar limpieza de todos los pasillos comunes",
  // "personal": "Maria Limpieza",
  // "fecha_asignacion": "2025-09-24",
  // "hora_realizacion": null,
  // "estado": "pendiente",
  // "personal_id": 4

  final int? id;
  final int? id_tarea;
  final String? tarea;
  final String? descripcion;
  final String? personal;
  final String? fecha_asignacion;
  final String? hora_realizacion;
  final String? estado;
  final int? personal_id;

  TareaModel({
    this.id,
    this.id_tarea,
    this.tarea,
    this.descripcion,
    this.personal,
    this.fecha_asignacion,
    this.hora_realizacion,
    this.estado,
    this.personal_id,
  });

  factory TareaModel.fromJson(Map<String, dynamic> json) {
    return TareaModel(
      id: json['id'],
      id_tarea: json['id_tarea'],
      tarea: json['tarea'],
      descripcion: json['descripcion'],
      personal: json['personal'],
      fecha_asignacion: json['fecha_asignacion'],
      hora_realizacion: json['hora_realizacion'],
      estado: json['estado'],
      personal_id: json['personal_id'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'id_tarea': id_tarea,
    'tarea': tarea,
    'descripcion': descripcion,
    'personal': personal,
    'fecha_asignacion': fecha_asignacion,
    'hora_realizacion': hora_realizacion,
    'estado': estado,
    'personal_id': personal_id,
  };
}
