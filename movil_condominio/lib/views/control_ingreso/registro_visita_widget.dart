// import 'package:flutter/material.dart';
// import 'package:movil_condominio/models/persona_model.dart';
// import 'package:movil_condominio/models/registro_visita_model.dart';
// import 'package:movil_condominio/models/response__model.dart';

// import '../../services/control_ingreso_service.dart';

// class RegistroVisitaWidget extends StatefulWidget {
//   final int idPeticion;
//   final int idCopropietario;
//   final PersonaModel personaModel;
//   const RegistroVisitaWidget({
//     super.key,
//     required this.idPeticion,
//     required this.idCopropietario,
//     required this.personaModel,
//   });

//   @override
//   State<RegistroVisitaWidget> createState() => _RegistroVisitaWidgetState();
// }

// class _RegistroVisitaWidgetState extends State<RegistroVisitaWidget> {
//   RegistroVisitaModel? registro;
//   bool loading = true;
//   bool registrando = false;
//   String? mensaje;

//   final ControlIngresoService _service = ControlIngresoService();

//   @override
//   void initState() {
//     super.initState();
//     _cargarRegistro();
//   }

//   Future<void> _cargarRegistro() async {
//     setState(() => loading = true);
//     try {
//       final detalle = await _service.obtenerDetalleVisita(widget.idPeticion);
//       setState(() {
//         registro = detalle;
//         loading = false;
//       });
//     } catch (e) {
//       setState(() {
//         mensaje = "No se pudo cargar el detalle: $e";
//         loading = false;
//       });
//     }
//   }

//   Future<void> _registrarVisita() async {
//     setState(() {
//       registrando = true;
//       mensaje = null;
//     });
//     try {
//       final ResponseModel resp = await _service.registrarVisita(
//         widget.idPeticion,
//         widget.idCopropietario,
//         widget.personaModel.idPersona ?? 0,
//       );
//       setState(() {
//         mensaje = resp.message;
//         registrando = false;
//       });
//       // Vuelve a cargar detalles para reflejar el cambio:
//       await _cargarRegistro();
//     } catch (e) {
//       setState(() {
//         mensaje = "Error al registrar visita: $e";
//         registrando = false;
//       });
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return SizedBox(
//       width: 340,
//       child: Padding(
//         padding: const EdgeInsets.all(20),
//         child: loading
//             ? const Center(child: CircularProgressIndicator())
//             : Column(
//                 mainAxisSize: MainAxisSize.min,
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(
//                     "Solicitud #${widget.idPeticion}",
//                     style: const TextStyle(
//                       fontWeight: FontWeight.bold,
//                       fontSize: 18,
//                     ),
//                   ),
//                   const SizedBox(height: 10),
//                   Row(
//                     children: [
//                       const Icon(Icons.login, color: Colors.green, size: 18),
//                       const SizedBox(width: 6),
//                       Text(
//                         "Entrada: ${registro?.horaEntrada ?? "Sin registro"}",
//                       ),
//                     ],
//                   ),
//                   const SizedBox(height: 8),
//                   Row(
//                     children: [
//                       const Icon(Icons.logout, color: Colors.red, size: 18),
//                       const SizedBox(width: 6),
//                       Text("Salida: ${registro?.horaSalida ?? "Sin registro"}"),
//                     ],
//                   ),
//                   const SizedBox(height: 16),
//                   if (mensaje != null)
//                     Text(mensaje!, style: const TextStyle(color: Colors.green)),
//                   if (registro?.horaEntrada == null)
//                     SizedBox(
//                       width: double.infinity,
//                       child: ElevatedButton.icon(
//                         icon: const Icon(Icons.login),
//                         label: registrando
//                             ? const SizedBox(
//                                 width: 18,
//                                 height: 18,
//                                 child: CircularProgressIndicator(
//                                   strokeWidth: 2,
//                                 ),
//                               )
//                             : const Text("Registrar ingreso"),
//                         onPressed: registrando ? null : _registrarVisita,
//                       ),
//                     ),
//                   if (registro?.horaEntrada != null)
//                     const Text(
//                       "Visita ya registrada.",
//                       style: TextStyle(color: Colors.grey, fontSize: 15),
//                     ),
//                   const SizedBox(height: 6),
//                   Align(
//                     alignment: Alignment.centerRight,
//                     child: TextButton(
//                       child: const Text("Cerrar"),
//                       onPressed: () => Navigator.of(context).pop(),
//                     ),
//                   ),
//                 ],
//               ),
//       ),
//     );
//   }
// }
