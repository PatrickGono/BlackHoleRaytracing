#version 330 core
in vec2 texture_coords;
in vec3 frag_pos;

out vec4 frag_color;

uniform sampler2D our_texture;

void main()
{
	// vec4 result = texture(our_texture, texture_coords);
	// frag_color = result;//vec4(textureCoords.x, textureCoords.y, 0.0f, 1.0f); 
	frag_color = texture(our_texture, texture_coords);
}