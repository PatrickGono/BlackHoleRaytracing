#version 330 core
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTextureCoords;

out vec2 texture_coords;
out vec3 frag_pos;

uniform mat4 projection;

void main()
{
    gl_Position = projection * vec4(aPosition.xyz, 1.0);
	frag_pos = vec3(aPosition);
	texture_coords = aTextureCoords;
}