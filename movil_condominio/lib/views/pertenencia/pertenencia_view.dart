import 'package:flutter/material.dart';
import 'package:movil_condominio/services/pertenencia_service.dart';

class ListaPertenenciaView extends StatefulWidget {
  const ListaPertenenciaView({super.key});

  @override
  State<ListaPertenenciaView> createState() => _ListaPertenenciaViewState();
}

class _ListaPertenenciaViewState extends State<ListaPertenenciaView> {
  late Future<Map<String, dynamic>> _pertenenciasFuture;
  final PertenenciaService _service = PertenenciaService();

  @override
  void initState() {
    super.initState();
    _cargarPertenencias();
  }

  void _cargarPertenencias() {
    setState(() {
      _pertenenciasFuture = _service.fetchPertenencias();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Pertenencias")),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _pertenenciasFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          } else if (!snapshot.hasData) {
            return const Center(child: Text("No hay pertenencias"));
          }

          final vehiculos = snapshot.data!['vehiculos'];
          final mascotas = snapshot.data!['mascotas'];

          return ListView(
            children: [
              const ListTile(
                title: Text(
                  "🚗 Vehículos",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              ...vehiculos.map<Widget>(
                (v) => ListTile(
                  leading: const Icon(Icons.directions_car),
                  title: Text("${v.marca} ${v.modelo}"),
                  subtitle: Text("Placa: ${v.placa} | Estado: ${v.estado}"),
                ),
              ),
              const Divider(),
              const ListTile(
                title: Text(
                  "🐶 Mascotas",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              ...mascotas.map<Widget>(
                (m) => ListTile(
                  leading: const Icon(Icons.pets),
                  title: Text("${m.nombre} (${m.tipo})"),
                  subtitle: Text("Raza: ${m.raza} | Color: ${m.color ?? '-'}"),
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _cargarPertenencias,
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
