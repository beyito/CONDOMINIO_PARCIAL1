class Persona {
  final int id;
  final String nombre;
  final String apellido;
  final String documento;

  Persona({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.documento,
  });

  factory Persona.fromJson(Map<String, dynamic> json) {
    return Persona(
      id: json['id'],
      nombre: json['nombre'],
      apellido: json['apellido'],
      documento: json['documento'],
    );
  }
}
