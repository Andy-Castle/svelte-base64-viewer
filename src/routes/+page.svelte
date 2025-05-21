<script lang="ts">
	import '../app.css';
	import { detectMime, getContent } from '$lib/utils';

	let base64 = '';
	let mime: string | null = null;
	let blobUrl: string | null = null;
	let error: string | null = null;

	function handleInput() {
		error = null;
		blobUrl = null;
		mime = null;

		if (!base64.trim()) {
			error = 'Por favor, pega una cadena Base64 válida.';
			return;
		}

		let rawBase64 = base64.trim();
		let binary: string;

		// Si incluye prefijo, detectamos MIME y extraemos contenido
		if (rawBase64.startsWith('data:')) {
			mime = detectMime(rawBase64);
			rawBase64 = getContent(rawBase64);
			try {
				binary = atob(rawBase64);
			} catch {
				error = 'La cadena Base64 es inválida o no se pudo procesar.';
				return;
			}
		} else {
			// Sin prefijo, decodificamos provisionalmente para chequeo
			try {
				binary = atob(rawBase64);
			} catch {
				error = 'La cadena Base64 es inválida o no se pudo procesar.';
				return;
			}
			// Detectar PDF por firma '%PDF-'
			if (binary.startsWith('%PDF-')) {
				mime = 'application/pdf';
			} else {
				mime = 'text/csv';
			}
		}

		// Crear blob y URL
		try {
			const len = binary.length;
			const bytes = new Uint8Array(len);
			for (let i = 0; i < len; i++) {
				bytes[i] = binary.charCodeAt(i);
			}
			const blob = new Blob([bytes], { type: mime! });
			blobUrl = URL.createObjectURL(blob);
		} catch {
			error = 'Error al generar el archivo para vista previa.';
			return;
		}
	}
</script>

<div class="flex h-screen">
	<!-- Izquierda: Entrada -->
	<div class="w-1/2 flex flex-col p-8 bg-gray-50">
		<h1 class="text-3xl font-bold mb-6 text-center">Visualizador de Base64</h1>

		<textarea
			bind:value={base64}
			class="w-full h-64 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
			placeholder="Pega aquí tu Base64 (con o sin prefijo)..."
		></textarea>

		<button
			on:click={handleInput}
			class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mx-auto"
		>
			Visualizar
		</button>

		<button
			on:click={() => {
				base64 = '';
				mime = null;
				blobUrl = null;
				error = null;
			}}
			class="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition mx-auto"
		>
			Borrar
		</button>

		{#if mime}
			<p class="mt-4 text-center text-sm text-gray-700"><strong>Tipo MIME:</strong> {mime}</p>
		{/if}

		{#if error}
			<p class="mt-2 text-center text-sm text-red-600">{error}</p>
		{/if}
	</div>

	<!-- Derecha: Vista -->
	<div class="w-1/2 p-8 bg-white border-l border-gray-200">
		{#if blobUrl && mime?.includes('pdf')}
			<iframe src={blobUrl} title="Vista previa PDF" class="w-full h-full rounded-md shadow" />
		{:else if blobUrl && mime?.includes('csv')}
			<a href={blobUrl} download="archivo.csv" class="text-blue-600 underline">Descargar CSV</a>
		{:else if blobUrl && mime?.includes('image')}
			<img
				src={blobUrl}
				alt="Imagen Base64"
				class="w-full h-full object-contain rounded-md shadow"
			/>
		{:else if blobUrl}
			<a href={blobUrl} download="archivo" class="text-blue-600 underline">Descargar archivo</a>
		{:else}
			<div class="w-full h-full flex items-center justify-center text-gray-400">
				Previsualización...
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";
	:global(html) {
		background-color: theme(--color-gray-100);
	}
</style>
