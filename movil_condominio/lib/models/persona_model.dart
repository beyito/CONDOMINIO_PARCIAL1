class PersonaModel {
  final String? ci;
  final int? idPersona;
  final String? nombre;
  final String? telefono;
  final String? tipoPase;

  PersonaModel({
    this.ci,
    this.idPersona,
    this.nombre,
    this.telefono,
    this.tipoPase,
  });

  factory PersonaModel.fromJson(Map<String, dynamic> json) {
    return PersonaModel(
      ci: json['ci'] ?? 0,
      idPersona: json['idPersona'] ?? 0,
      nombre: json['nombre'] ?? "",
      telefono: json['telefono'] ?? "",
      tipoPase: json['TIPO_PASE'] ?? "",
    );
  }

  Map<String, dynamic> toJson() => {
        'ci': ci,
        'idPersona': idPersona,
        'nombre': nombre,
        'telefono': telefono,
        'TIPO_PASE': tipoPase,
      };
}
