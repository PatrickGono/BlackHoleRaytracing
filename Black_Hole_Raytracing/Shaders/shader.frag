#version 330 core

out vec4 fragColor;

uniform float screenWidth;
uniform float screenHeight;

vec3 getRayDirection()
{
	float relX = 2.0f * (gl_FragCoord.x / screenWidth - 0.5f);
	float relY = 2.0f * (gl_FragCoord.y / screenHeight - 0.5f);
	float fovFactor = 0.8f;
	return normalize(vec3(fovFactor * relX, fovFactor * relY, 1.0f));
}

void main()
{
	// vec4 result = vec4(gl_FragCoord.x, gl_FragCoord.y, 0.0, 1.0);
	// fragColor = vec4(gl_FragCoord.x / screenWidth, gl_FragCoord.y / screenHeight, 0.0f, 1.0f);
	vec3 rayDirection = getRayDirection();
	fragColor = vec4(rayDirection.z * rayDirection.z, 0.0f, 0.0f, 1.0f);
}