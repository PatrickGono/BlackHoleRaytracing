#version 330 core
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTextureCoords;

out vec2 textureCoords;

void main()
{
	gl_Position = vec4(aPosition.x, aPosition.y, aPosition.z, 1.0);
	textureCoords = aTextureCoords;
}