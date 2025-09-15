class RegistroVisitaModel {
  final int? id;
  final String? horaEntrada;
  final String? horaSalida;

  RegistroVisitaModel({
    this.id,
    this.horaEntrada,
    this.horaSalida,
  });

  factory RegistroVisitaModel.fromJson(Map<String, dynamic> json) {
    return RegistroVisitaModel(
      id: json['id'] ?? 0,
      horaEntrada: json['hora_entrada'] ?? "",
      horaSalida: json['hora_salida'] ?? "",
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'hora_entrada': horaEntrada,
        'hora_salida': horaSalida,
      };
}
