import 'package:flutter/material.dart';
import 'package:movil_condominio/services/control_ingreso_service.dart';
import 'package:movil_condominio/models/autorizacion_visita_model.dart';
import 'package:movil_condominio/widgets/visita_widget.dart';

class ControlIngresoView extends StatefulWidget {
  const ControlIngresoView({super.key});

  @override
  State<ControlIngresoView> createState() => _ControlIngresoViewState();
}

class _ControlIngresoViewState extends State<ControlIngresoView> {
  final ControlIngresoService _service = ControlIngresoService();
  late Future<List<AutorizacionVisitaModel>> _futureVisitas;

  @override
  void initState() {
    super.initState();
    _futureVisitas = _service.mostrarSolicitudes();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Solicitudes de Visita")),
      body: FutureBuilder<List<AutorizacionVisitaModel>>(
        future: _futureVisitas,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          }
          final visitas = snapshot.data ?? [];
          if (visitas.isEmpty) {
            return const Center(child: Text("No hay visitas registradas."));
          }
          return RefreshIndicator(
            onRefresh: () async {
              // Nueva petición al backend:
              setState(() {
                _futureVisitas = _service.mostrarSolicitudes();
              });
              // Espera a que el future termine antes de quitar el loader de pull-to-refresh
              await _futureVisitas;
            },
            child: ListView.builder(
              itemCount: visitas.length,
              itemBuilder: (context, index) =>
                  VisitaWidget(visita: visitas[index]),
            ),
          );
        },
      ),
    );
  }
}
