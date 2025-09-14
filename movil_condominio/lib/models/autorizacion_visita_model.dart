import 'dart:convert';
import 'package:movil_condominio/models/persona_model.dart';

class AutorizacionVisitaModel {
  final int? id;
  final DateTime? horaInicio;
  final DateTime? horaFin;
  final String? motivo_visita;
  final String? nombreCopropietario;
  final String? nombrePersona;
  final String? apellidoPersona;
  final String? estado;
  AutorizacionVisitaModel({
    this.id,
    this.horaInicio,
    this.horaFin,
    this.motivo_visita,
    this.nombreCopropietario,
    this.apellidoPersona,
    this.nombrePersona,
    this.estado,
  });

  factory AutorizacionVisitaModel.fromJson(Map<String, dynamic> json) {
    return AutorizacionVisitaModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()),
      nombreCopropietario: json['copropietario']?.toString(),
      horaInicio: json['fecha_inicio'] != null
          ? DateTime.tryParse(json['fecha_inicio'].toString())
          : null,
      horaFin: json['fecha_fin'] != null
          ? DateTime.tryParse(json['fecha_fin'].toString())
          : null,
      nombrePersona: json['nombre']?.toString(),
      apellidoPersona: json['apellido']?.toString(),
      motivo_visita: json['motivo_visita']?.toString(),
      estado: json['estado']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'nombreCopropietario': nombreCopropietario,
    'horaInicio': horaInicio?.toIso8601String(),
    'horaFin': horaFin?.toIso8601String(),
    'nombrePersona': nombrePersona,
    'apellidoPersona': apellidoPersona,
    'motivo_visita': motivo_visita,
    'estado': estado,
  };
}
